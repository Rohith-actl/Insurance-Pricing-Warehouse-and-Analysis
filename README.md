# Insurance-Pricing-Warehouse-and-Analysis
Insurance Pricing Analytics Platform

Overview:
This project simulates an insurance pricing data warehouse and analytics platform for life and health products. It evaluates portfolio performance across 5,000 policies and ~145 claims, analyzing loss ratios, claim frequency, severity, cohort deterioration, duration curves, and regional performance.

Purpose:
The platform is designed to support actuarial decision-making, enabling users to identify portfolio trends, assess pricing adequacy, and monitor product and regional risk exposures. It provides actionable insights while highlighting credibility constraints for smaller segments.

Technical Approach:
All core analytics logic is implemented in SQL, including joins, aggregations, window functions (RANK, LAG), and CTEs. The SQL engine is embedded within a JavaScript-based dashboard, providing interactive visualizations, multi-year trend analysis, and AI-assisted actuarial commentary. Users can upload their own datasets or use a professional-scale sample dataset.

Highlights:

Loss ratio and cohort trend analysis

Product and region-level insights

SQL-driven calculations presented in an interactive UI

Future enhancements roadmap includes IBNR, GLM pricing, credibility modeling, and reinsurance scenarios

Demonstrates end-to-end actuarial analytics workflow with SQL-driven logic in a professional-grade interactive interface.
