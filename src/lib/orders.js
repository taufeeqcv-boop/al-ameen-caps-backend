/**
 * Admin-only order helpers (cash sales, etc.). Requires authenticated Supabase user with is_admin.
 */
import { supabase } from "./supabase";

/**
 * Record a walk-in / manual cash sale: creates order (PAID), order_items, decrements product stock.
 * Uses the signed-in admin user_id on the order row (required by schema).
 *
 * @param {object} opts
 * @param {Array<{ product_id: number, quantity: number }>} opts.items
 * @param {string} [opts.customerEmail]
 * @param {string} [opts.adminNotes]
 * @param {object} [opts.shippingData] optional JSON snapshot
 * @returns {Promise<{ orderId: string, total: number }>}
 */
export async function insertCashSaleOrder({ items, customerEmail, adminNotes, shippingData }) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!items?.length) throw new Error("At least one line item is required.");

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("You must be signed in.");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile?.is_admin) {
    throw new Error("Only admins can log cash sales.");
  }

  const lines = [];
  let total = 0;

  for (const line of items) {
    const pid = Number(line.product_id);
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isFinite(pid) || pid <= 0) throw new Error(`Invalid product_id: ${line.product_id}`);
    if (!Number.isFinite(qty) || qty <= 0) throw new Error(`Invalid quantity for product ${pid}`);

    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity")
      .eq("id", pid)
      .single();

    if (prodErr || !product) throw new Error(`Product not found: ${pid}`);
    const stock = Number(product.stock_quantity) || 0;
    if (stock < qty) {
      throw new Error(`Insufficient stock for ${product.name} (have ${stock}, need ${qty}).`);
    }

    const unit = Number(product.price);
    total += unit * qty;
    lines.push({
      product,
      quantity: qty,
      unit_price: unit,
    });
  }

  const noteParts = ["Cash sale"];
  if (adminNotes?.trim()) noteParts.push(adminNotes.trim());

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "PAID",
      total_amount: Number(total.toFixed(2)),
      payment_method: "cash",
      customer_email: customerEmail?.trim() || null,
      admin_notes: noteParts.join(" — "),
      shipping_data: shippingData ?? { type: "cash_sale" },
    })
    .select("id")
    .single();

  if (orderErr || !order?.id) {
    throw new Error(orderErr?.message || "Could not create order.");
  }

  const orderId = order.id;

  for (const line of lines) {
    const { error: oiErr } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: line.product.id,
      quantity: line.quantity,
      unit_price: line.unit_price,
      product_name: line.product.name,
    });
    if (oiErr) {
      throw new Error(oiErr.message || "Failed to insert order items.");
    }
  }

  for (const line of lines) {
    const newStock = Math.max(0, Number(line.product.stock_quantity) - line.quantity);
    const { error: stockErr } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", line.product.id);
    if (stockErr) {
      throw new Error(stockErr.message || "Order created but stock update failed — fix in Admin.");
    }
  }

  return { orderId, total: Number(total.toFixed(2)) };
}
