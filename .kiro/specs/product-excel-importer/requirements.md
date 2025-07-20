# Requirements Document

## Introduction

This feature enhances the existing AggregatedExcelImporter component to properly handle product data from Excel files, specifically the PRODUCT APRIL-2025.xlsx format. The current importer is designed for service orders but needs to be extended to handle product inventory imports with proper stock management, product master updates, and validation.

## Requirements

### Requirement 1

**User Story:** As a salon manager, I want to import product data from Excel files so that I can efficiently update my product inventory and maintain accurate stock levels.

#### Acceptance Criteria

1. WHEN I select a product Excel file THEN the system SHALL detect it as product data and offer product import options
2. WHEN I analyze a product Excel file THEN the system SHALL validate the required columns (PRODUCT NAME, HSN CODE, Category, Qty, Unit Price, etc.)
3. WHEN product data is missing required fields THEN the system SHALL display clear error messages with suggestions
4. WHEN I preview product data THEN the system SHALL show a summary of products to be imported with stock quantities and pricing

### Requirement 2

**User Story:** As a salon manager, I want the system to automatically update the product_master table so that new products are added and existing products have their stock updated correctly.

#### Acceptance Criteria

1. WHEN importing products THEN the system SHALL check if each product exists in product_master by matching name, category, and HSN code
2. IF a product does not exist THEN the system SHALL create a new product record with all available details
3. IF a product already exists THEN the system SHALL update the stock quantity by adding the imported quantity
4. WHEN creating or updating products THEN the system SHALL preserve all Excel data in a raw_data field for audit purposes
5. WHEN stock updates occur THEN the system SHALL log the changes with timestamps and source information

### Requirement 3

**User Story:** As a salon manager, I want to see detailed mapping between Excel data and database fields so that I can verify the import accuracy before committing changes.

#### Acceptance Criteria

1. WHEN I analyze product data THEN the system SHALL show a detailed preview of how Excel columns map to database fields
2. WHEN displaying the preview THEN the system SHALL show both raw Excel data and the final mapped data side by side
3. WHEN there are data transformation issues THEN the system SHALL highlight them in the preview with explanations
4. WHEN I expand order details THEN the system SHALL show the complete product payload that will be inserted into the database

### Requirement 4

**User Story:** As a salon manager, I want the import process to handle errors gracefully so that I can identify and fix data issues without losing progress.

#### Acceptance Criteria

1. WHEN importing products with errors THEN the system SHALL continue processing valid records and report failed ones
2. WHEN validation fails THEN the system SHALL provide specific error messages indicating the row number and issue
3. WHEN the import completes THEN the system SHALL show a summary of successful imports, failures, and any warnings
4. WHEN errors occur THEN the system SHALL log detailed error information to the console for debugging

### Requirement 5

**User Story:** As a salon manager, I want the product import to integrate seamlessly with the existing order import functionality so that I can handle mixed data types efficiently.

#### Acceptance Criteria

1. WHEN I select an import type THEN the system SHALL offer options for Services, Products, Orders (Mixed), and Memberships
2. WHEN I choose product import THEN the system SHALL filter and process only product-related data from the Excel file
3. WHEN processing mixed orders THEN the system SHALL handle both service and product line items correctly
4. WHEN importing products THEN the system SHALL maintain compatibility with existing service import workflows