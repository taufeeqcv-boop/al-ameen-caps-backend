# Fastway Couriers South Africa – System Overview (2023)

*Summary from official **FW System Capabilities - 2023.pdf** for Al-Ameen Caps reference.*

## eCommerce solutions

Fastway integrates with **WooCommerce, Shopify, Ecwid, Netcash Shop, Magento, PrestaShop, OpenCart**. Integration includes:

- **Real-time shipping calculator** – uses Suburb (City) & Postal Code at checkout
- **Automated box packer** – calculates number of boxes per order
- **Product shipping** – override product weight/dimensions or use defaults
- **Product exclusion** – exclude specific products from packing/shipping calc
- **Create shipments** – options for when/how to create a shipment
- **Print labels** – from the eCommerce app to any printer
- **eWallet balance** – view available credit
- **Products** – import products, add dimensions & weight for accurate delivery cost at checkout
- **Multi-user support** – fulfill from multiple Fastway eWallet accounts from one store

## Track & trace

- White-labelled tracking iframe for your site (brand-aligned)
- Customisable colours to match your brand
- Fastway contact details for last scanned depot
- Visual tracking for customers

## eWallet & customer portal

- Electronic labelling; debit wallet on quotation acceptance
- Parcel status notifications on scanning
- Import existing customer database
- Web-based; print dispatch labels on your own printer
- Arrange collections (suppliers/returns)
- Logistical reports
- Real-time track and trace; signature proof of delivery; geolocation

## API integration

- **RESTful API** for third-party integration (programmers only).
- Push data to Fastway without import files; generate labels (PDF or thermal via remote agent); render track & trace and quoting on your site.
- **Public areas:** Price Service Calculator (`/v3/psc`), Track and Trace (`/v3/tracktrace`). Invocation URL base: https://sa.api.fastway.org/v3
- **Restricted areas:** Not public; request access by email to it.support@fastway.co.za with your API key and business name. If granted, view docs by appending `api_key` parameter to the docs page with your Fastway API key.
- Fastway supports developers who access the API directly; have an example API call (URL) ready when contacting support.

## Dedicated CSD (high volume)

- White-labelled PWA, customisable tracking
- Live chat with dedicated CSD agent
- Support tickets, CSD reports, dedicated Fastway mailbox

---

*Source: FW System Capabilities - 2023.pdf. Use when planning shipping/courier integration for Al-Ameen Caps.*
