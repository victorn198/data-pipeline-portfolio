# Canonical Dataset

The core ecommerce data now comes from a single governed source: the UCI Online
Retail dataset.

- Source: `https://archive.ics.uci.edu/dataset/352/online+retail`
- Local canonical file: `data/canonical/online_retail_uci_sample.csv`
- Rebuild command: `python scripts/build_canonical_online_retail_sample.py`
- Grain: one row per retail transaction line
- Standard load size: 100,000 transaction lines
- Derived entities: customers, products, and order lines are generated from the
  same canonical file

## Why This Dataset

The previous generated ecommerce data was useful for proving volume, but it made
some KPI behavior look artificial. The UCI retail source gives the dashboard
more realistic baskets, repeat customers, product descriptions, cancellations,
international geography, and uneven product/customer concentration.

## Transformations

The project stores a compact, deterministic sample so CI and portfolio demos do
not depend on downloading the full spreadsheet. The sample keeps the original
retail transaction shape, shifts dates forward for modern dashboard windows, and
derives stable IDs:

- `order_line_id`: stable fact grain for each transaction line
- `order_id`: invoice/order identifier that can contain multiple lines
- `customer_id`: normalized customer key
- `product_id`: normalized stock/SKU key

Auxiliary CRM, billing, support, and marketing fixtures are aligned to customers
and cities from this canonical retail base. They remain controlled portfolio
fixtures, but they no longer tell a disconnected data story.
