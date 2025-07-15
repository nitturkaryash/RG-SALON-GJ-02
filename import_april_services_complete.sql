-- Complete Import of April 2025 Services Data with Proper Invoice Merging
-- This script creates merged invoices where same client + invoice number = single bill
-- Payment methods include amounts in brackets for multi-payment scenarios
-- Run this script manually in Supabase SQL Editor
-- Total records: 790 services across multiple invoices

-- Disable RLS temporarily for bulk import
SET row_security = off;

-- Create the complete raw data as a temporary table
CREATE TEMP TABLE temp_service_data AS
WITH raw_data AS (
    SELECT * FROM (VALUES
        ('1', '2025-03-31 18:38:50'::timestamp, 'Zarna Javeri', '9824770184', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('2', '2025-03-31 18:38:50'::timestamp, 'Tarun Vatiani', '9904079784', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('2', '2025-03-31 18:38:50'::timestamp, 'Tarun Vatiani', '9904079784', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('3', '2025-03-31 18:38:50'::timestamp, 'Neharika Malhotra', '8882819968', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'card'),
        ('4', '2025-03-31 18:38:50'::timestamp, 'Kira', '8141038380', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 600, 18, 'gpay'),
        ('5', '2025-03-31 18:38:50'::timestamp, 'Rahul Kedia', '9978122122', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('6', '2025-03-31 18:38:50'::timestamp, 'Aashi', '8140195963', 'Juni', 'Intense Rituals', 2600, 1, 260, 18, 'gpay'),
        ('6', '2025-03-31 18:38:50'::timestamp, 'Aashi', '8140195963', 'Wailed', 'Intense Rituals', 2600, 1, 260, 18, 'gpay'),
        ('7', '2025-03-31 18:38:50'::timestamp, 'Jigyasha Narang', '9825760192', 'Anu Khaling Rai', 'Eyebrow', 100, 2, 0, 18, 'cash'),
        ('7', '2025-03-31 18:38:50'::timestamp, 'Jigyasha Narang', '9825760192', 'Anu Khaling Rai', 'Wash & Blow Dry', 700, 1, 0, 18, 'cash'),
        ('8', '2025-03-31 18:38:50'::timestamp, 'Gauri Savaliya', '9913311455', 'Toshi Jamir', 'Creative Color', 15500, 1, 0, 18, 'card'),
        ('9', '2025-03-31 18:38:50'::timestamp, 'Muskan Nandwani', '9016589750', 'Admin', 'Hair Strengthning', 2500, 1, 0, 18, 'card'),
        ('10', '2025-03-31 18:38:50'::timestamp, 'Nikita Shah', '9824130919', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 650, 1, 0, 18, 'cash'),
        ('11', '2025-03-31 18:38:50'::timestamp, 'Prachi patel', '9925326920', 'Shubham Khalashi', 'Root Touch Up', 40, 30, 0, 18, 'cash'),
        ('12', '2025-03-31 18:38:50'::timestamp, 'Dimple Sharma', '8128998353', 'Admin', 'FACE PACK', 1000, 1, 0, 18, 'gpay'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Anu Khaling Rai', 'Classic Pedicure', 1400, 1, 140, 18, 'cash'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Juni', 'Classic Manicure', 1200, 1, 120, 18, 'cash'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Anu Khaling Rai', 'Eyebrow', 100, 1, 0, 18, 'cash'),
        ('14', '2025-04-01 18:38:50'::timestamp, 'Seep Mahajan', '9825183837', 'Anju Rumdali Rai', 'Root Touch Up', 40, 60, 0, 18, 'gpay'),
        ('15', '2025-04-01 18:38:50'::timestamp, 'Pooja Goyal', '9913465019', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'gpay'),
        ('16', '2025-04-01 18:38:50'::timestamp, 'deepak bulchandi', '9925007176', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('18', '2025-04-01 18:38:50'::timestamp, 'Sashwot', '8734005134', 'Aiban Marwein', 'Full Leg Wax', 950, 1, 0, 18, 'gpay'),
        ('19', '2025-04-01 18:38:50'::timestamp, 'Dhawal Doshi', '8320117268', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'cash'),
        ('19', '2025-04-01 18:38:50'::timestamp, 'Dhawal Doshi', '8320117268', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'cash'),
        ('20', '2025-04-01 18:38:50'::timestamp, 'Veena Kodwani Dawer', '9825144666', 'Shubham Khalashi', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('21', '2025-04-01 18:38:50'::timestamp, 'ashha jain', '9898860007', 'Ajay Shirsath', 'Olaplex Hair Treatment', 2600, 1, 260, 18, 'cash'),
        ('22', '2025-04-01 18:38:50'::timestamp, 'Richa Dhingra', '9879062092', 'Jenet', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('22', '2025-04-01 18:38:50'::timestamp, 'Richa Dhingra', '9879062092', 'Jenet', 'Classic Pedicure', 1400, 1, 140, 18, 'cash'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Juni', 'Rituals Express Hair Spa', 1800, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Wailed', 'Rituals Express Hair Spa', 1800, 1, 0, 18, 'gpay'),
        ('24', '2025-04-01 18:38:50'::timestamp, 'Harsh Seth', '9327241002', 'Aiban Marwein', 'Head Massage With Oil', 1500, 1, 0, 18, 'gpay'),
        ('24', '2025-04-01 18:38:50'::timestamp, 'Harsh Seth', '9327241002', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('25', '2025-04-01 18:38:50'::timestamp, 'Kavita Mittal', '9712900696', 'Rupesh Mahale', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('26', '2025-04-01 18:38:50'::timestamp, 'Gaurav', '9426439142', 'Rupesh Mahale', 'Global Color', 40, 30, 0, 18, 'gpay'),
        ('27', '2025-04-01 18:38:50'::timestamp, 'Chintan jariwala', '9913333667', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 650, 1, 0, 18, 'cash'),
        ('28', '2025-04-02 18:38:50'::timestamp, 'Preeti', '9879013960', 'Jenet', 'Root Touch Up', 40, 55, 0, 18, 'card'),
        ('28', '2025-04-02 18:38:50'::timestamp, 'Preeti', '9879013960', 'Jenet', 'Classic Pedicure', 1400, 1, 0, 18, 'card'),
        ('29', '2025-04-02 18:38:50'::timestamp, 'Rusali Valani', '8758545160', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('30', '2025-04-02 18:38:50'::timestamp, 'Shreya Jaju', '9979376000', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'cash'),
        ('31', '2025-04-02 18:38:50'::timestamp, 'sanjay virani', '9825460464', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('32', '2025-04-02 18:38:50'::timestamp, 'Pankaj Dhingra', '9825132111', 'Mehul Kinariwala', 'Global Color', 40, 30, 0, 18, 'cash'),
        ('33', '2025-04-02 18:38:50'::timestamp, 'Lakshmi Baid', '9879534594', 'Kinal Solanki', 'Normal Wash', 550, 1, 0, 18, 'gpay'),
        ('34', '2025-04-02 18:38:50'::timestamp, 'Viraj Khandwala', '9925014404', 'Shubham Khalashi', 'Global Color', 40, 100, 0, 18, 'card'),
        ('34', '2025-04-02 18:38:50'::timestamp, 'Viraj Khandwala', '9925014404', 'Jenet', 'Classic Manicure', 1200, 1, 0, 18, 'card'),
        ('35', '2025-04-02 18:38:50'::timestamp, 'Vincy Parekh', '9909982165', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'cash'),
        ('35', '2025-04-02 18:38:50'::timestamp, 'Vincy Parekh', '9909982165', 'Mehul Kinariwala', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'cash'),
        ('36', '2025-04-02 18:38:50'::timestamp, 'Shyam', '9712188844', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('37', '2025-04-02 18:38:50'::timestamp, 'Shipra Dave', '9978794444', 'Tenzy Pradhan', 'Wash & Blow Dry', 700, 1, 0, 18, 'gpay'),
        ('38', '2025-04-02 18:38:50'::timestamp, 'Harshita Agarwal', '8153020061', 'Anju Rumdali Rai', 'Intense Rituals', 2600, 1, 260, 18, 'cash'),
        ('39', '2025-04-02 18:38:50'::timestamp, 'anjali Sharma', '9898088015', 'Wailed', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('39', '2025-04-02 18:38:50'::timestamp, 'anjali Sharma', '9898088015', 'Anju Rumdali Rai', 'Color Toner', 40, 40, 0, 18, 'cash'),
        ('40', '2025-04-02 18:38:50'::timestamp, 'Minu Nandwani', '9825983111', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('42', '2025-04-02 18:38:50'::timestamp, 'Krunal Mahatma', '9909258116', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('42', '2025-04-02 18:38:50'::timestamp, 'Krunal Mahatma', '9909258116', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('42', '2025-04-02 18:38:50'::timestamp, 'Krunal Mahatma', '9909258116', 'Vandan Gohil', 'Beard Colour', 450, 1, 0, 18, 'card'),
        ('43', '2025-04-03 18:38:50'::timestamp, 'Toral Koshiya', '9825124353', 'Wailed', 'Root Touch Up', 1000, 1, 0, 18, 'card'),
        ('43', '2025-04-03 18:38:50'::timestamp, 'Toral Koshiya', '9825124353', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'card'),
        ('44', '2025-04-03 18:38:50'::timestamp, 'Maina Simediya', '8758040007', 'Shubham Khalashi', 'Root Touch Up', 40, 40, 0, 18, 'gpay'),
        ('45', '2025-04-03 18:38:50'::timestamp, 'Jay Dangar', '8980333900', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('46', '2025-04-03 18:38:50'::timestamp, 'Mannat Suknani', '9974983335', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('47', '2025-04-03 18:38:50'::timestamp, 'Rinkesh', '9512032271', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'card'),
        ('49', '2025-04-03 18:38:50'::timestamp, 'Nikita Rawal', '7016611944', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'gpay'),
        ('50', '2025-04-03 18:38:50'::timestamp, 'Hardik Gambhir', '9638830000', 'Mehul Kinariwala', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('50', '2025-04-03 18:38:50'::timestamp, 'Hardik Gambhir', '9638830000', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('51', '2025-04-03 18:38:50'::timestamp, 'Rupali Shah', '9925171479', 'Tenzy Pradhan', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('52', '2025-04-03 18:38:50'::timestamp, 'Chirag Vekariya', '9712929501', 'Mehul Kinariwala', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('52', '2025-04-03 18:38:50'::timestamp, 'Chirag Vekariya', '9712929501', 'Mehul Kinariwala', 'Clean Shaving', 500, 1, 0, 18, 'card'),
        ('53', '2025-04-03 18:38:50'::timestamp, 'vikash dang', '9327000007', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 0, 1, 0, 18, 'cash'),
        ('54', '2025-04-03 18:38:50'::timestamp, 'Jagruti Kabutarwala', '9825100455', 'Tenzy Pradhan', 'Olaplex Hair Treatment', 2600, 1, 260, 18, 'gpay'),
        ('55', '2025-04-03 18:38:50'::timestamp, 'Sukanya 98', '9824135003', 'Juni', 'Root Touch Up', 40, 60, 0, 18, 'cash'),
        ('56', '2025-04-04 18:38:50'::timestamp, 'Yazad Bhesania', '8980008614', 'Vandan Gohil', 'Beard Trim', 400, 1, 80, 18, 'cash'),
        ('56', '2025-04-04 18:38:50'::timestamp, 'Yazad Bhesania', '8980008614', 'Vandan Gohil', 'Beard Colour', 550, 1, 110, 18, 'cash'),
        ('57', '2025-04-04 18:38:50'::timestamp, 'Neha Vepari', '9824477398', 'Arpan sampang Rai', 'Global Color', 40, 100, 0, 18, 'card'),
        ('58', '2025-04-04 18:38:50'::timestamp, 'Tarun', '8744093733', 'Mehul Kinariwala', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'cash'),
        ('58', '2025-04-04 18:38:50'::timestamp, 'Tarun', '8744093733', 'Mehul Kinariwala', 'Beard Trim', 400, 1, 0, 18, 'cash'),
        ('59', '2025-04-04 18:38:50'::timestamp, 'Ruchika Savaliya', '9825114761', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('60', '2025-04-04 18:38:50'::timestamp, 'Dhiral Daruwala', '9099737779', 'Vandan Gohil', 'Beard Trim', 400, 1, 80, 18, 'gpay'),
        ('61', '2025-04-04 18:38:50'::timestamp, 'Yash', '7016855929', 'Vandan Gohil', 'Clean Shaving', 500, 1, 0, 18, 'gpay'),
        ('61', '2025-04-04 18:38:50'::timestamp, 'Yash', '7016855929', 'Anu Khaling Rai', 'Eyebrow', 100, 1, 0, 18, 'gpay'),
        ('62', '2025-04-04 18:38:50'::timestamp, 'Nancy Gangwani', '9925248333', 'Shubham Khalashi', 'Wash & Blow Dry', 700, 1, 0, 18, 'card'),
        ('62', '2025-04-04 18:38:50'::timestamp, 'Nancy Gangwani', '9925248333', 'Kinal Solanki', 'Wash And Twist', 700, 1, 0, 18, 'card'),
        ('63', '2025-04-04 18:38:50'::timestamp, 'Lisa Patel', '9313877024', 'Anju Rumdali Rai', 'Wash & Blow Dry', 700, 1, 0, 18, 'gpay'),
        ('65', '2025-04-04 18:38:50'::timestamp, 'Dhaval Mahatma', '9909000024', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('65', '2025-04-04 18:38:50'::timestamp, 'Dhaval Mahatma', '9909000024', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('65', '2025-04-04 18:38:50'::timestamp, 'Dhaval Mahatma', '9909000024', 'Anju Rumdali Rai', 'Chest Hair Trim', 800, 1, 0, 18, 'gpay'),
        ('66', '2025-04-04 18:38:50'::timestamp, 'Dr Ruta', '9428146427', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'gpay'),
        ('67', '2025-04-04 18:38:50'::timestamp, 'rashika', '9313191789', 'Toshi Jamir', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'card'),
        ('67', '2025-04-04 18:38:50'::timestamp, 'rashika', '9313191789', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('68', '2025-04-04 18:38:50'::timestamp, 'Payal Bhattar', '6359211222', 'Toshi Jamir', 'Keratin Treatment', 150, 65, 0, 18, 'card'),
        ('68', '2025-04-04 18:38:50'::timestamp, 'Payal Bhattar', '6359211222', 'Juni', 'Classic Manicure', 1200, 1, 0, 18, 'card'),
        ('68', '2025-04-04 18:38:50'::timestamp, 'Payal Bhattar', '6359211222', 'Aiban Marwein', 'Classic Pedicure', 1400, 1, 0, 18, 'card'),
        ('68', '2025-04-04 18:38:50'::timestamp, 'Payal Bhattar', '6359211222', 'Rupesh Mahale', 'Root Touch Up', 40, 50, 0, 18, 'card'),
        ('69', '2025-04-04 18:38:50'::timestamp, 'Abhilasha Agarwal', '9925234690', 'Pawan Pradhan', 'Epres treatment', 3000, 1, 0, 18, 'cash'),
        ('69', '2025-04-04 18:38:50'::timestamp, 'Abhilasha Agarwal', '9925234690', 'Anu Khaling Rai', 'Eyebrow', 100, 1, 0, 18, 'cash'),
        ('70', '2025-04-05 18:38:50'::timestamp, 'Savi 958', '9586630783', 'Aiban Marwein', 'Rituals Express Hair Spa', 1800, 1, 0, 18, 'cash'),
        ('72', '2025-04-05 18:38:50'::timestamp, 'Pari Gajera', '9979601022', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('72', '2025-04-05 18:38:50'::timestamp, 'Pari Gajera', '9979601022', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('73', '2025-04-05 18:38:50'::timestamp, 'Sunil Juneja', '9825942707', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'cash'),
        ('73', '2025-04-05 18:38:50'::timestamp, 'Sunil Juneja', '9825942707', 'Rupesh Mahale', 'Global Color', 40, 30, 0, 18, 'cash'),
        ('73', '2025-04-05 18:38:50'::timestamp, 'Sunil Juneja', '9825942707', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'cash'),
        ('73', '2025-04-05 18:38:50'::timestamp, 'Sunil Juneja', '9825942707', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('74', '2025-04-05 18:38:50'::timestamp, 'Tipu', '9825113984', 'Mehul Kinariwala', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('74', '2025-04-05 18:38:50'::timestamp, 'Tipu', '9825113984', 'Mehul Kinariwala', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('75', '2025-04-05 18:38:50'::timestamp, 'Jenish Champaniria', '8469465037', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('75', '2025-04-05 18:38:50'::timestamp, 'Jenish Champaniria', '8469465037', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('75', '2025-04-05 18:38:50'::timestamp, 'Jenish Champaniria', '8469465037', 'Anu Khaling Rai', 'Face De Tan', 1000, 1, 500, 18, 'gpay'),
        ('75', '2025-04-05 18:38:50'::timestamp, 'Jenish Champaniria', '8469465037', 'Anu Khaling Rai', 'Facial', 3000, 1, 0, 18, 'gpay'),
        ('76', '2025-04-05 18:38:50'::timestamp, 'Niddhi Kejriwal', '7899117192', 'Aiban Marwein', 'Classic Pedicure', 1400, 1, 140, 18, 'card'),
        ('76', '2025-04-05 18:38:50'::timestamp, 'Niddhi Kejriwal', '7899117192', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'card'),
        ('77', '2025-04-05 18:38:50'::timestamp, 'zubin joshina', '9879370000', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'gpay'),
        ('78', '2025-04-05 18:38:50'::timestamp, 'Niraj Joshi', '9403133261', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('79', '2025-04-05 18:38:50'::timestamp, 'Rajni', '9510813221', 'Anu Khaling Rai', 'Root Touch Up', 40, 55, 0, 18, 'gpay'),
        ('80', '2025-04-05 18:38:50'::timestamp, 'Zanab Alika', '9998755277', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('81', '2025-04-05 18:38:50'::timestamp, 'TANVI NILESH SUKHARAMWALA', '7506990106', 'Mehul Kinariwala', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('81', '2025-04-05 18:38:50'::timestamp, 'TANVI NILESH SUKHARAMWALA', '7506990106', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('81', '2025-04-05 18:38:50'::timestamp, 'TANVI NILESH SUKHARAMWALA', '7506990106', 'Shubham Khalashi', 'Wash & Blow Dry', 700, 1, 0, 18, 'card'),
        ('82', '2025-04-05 18:38:50'::timestamp, 'Ayush', '7575033264', 'Anu Khaling Rai', 'Eyebrow', 100, 1, 0, 18, 'card'),
        ('82', '2025-04-05 18:38:50'::timestamp, 'Ayush', '7575033264', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'card'),
        ('82', '2025-04-05 18:38:50'::timestamp, 'Ayush', '7575033264', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('83', '2025-04-05 18:38:50'::timestamp, 'Prince Rathi', '9913485853', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 0, 'cash'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 0, 'cash'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Rupesh Mahale', 'Global Color', 40, 40, 0, 0, 'cash'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 0, 'cash'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Rupesh Mahale', 'Beard Colour', 550, 1, 0, 0, 'cash'),
        ('84', '2025-04-05 18:38:50'::timestamp, 'Ajita Italiya', '9825850003', 'Toshi Jamir', 'Olaplex Hair Treatment', 2600, 1, 0, 0, 'cash'),
        ('85', '2025-04-05 18:38:50'::timestamp, 'Amit Agarwal', '9913433113', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('85', '2025-04-05 18:38:50'::timestamp, 'Amit Agarwal', '9913433113', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('86', '2025-04-05 18:38:50'::timestamp, 'Sanjay Kankariya', '7878048018', 'Mehul Kinariwala', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('86', '2025-04-05 18:38:50'::timestamp, 'Sanjay Kankariya', '7878048018', 'Aiban Marwein', 'Clean Up', 2000, 1, 0, 18, 'gpay'),
        ('87', '2025-04-05 18:38:50'::timestamp, 'Kinnari Usa', '9327346656', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'card'),
        ('87', '2025-04-05 18:38:50'::timestamp, 'Kinnari Usa', '9327346656', 'Aiban Marwein', 'Eyebrow', 100, 1, 0, 18, 'card'),
        ('87', '2025-04-05 18:38:50'::timestamp, 'Kinnari Usa', '9327346656', 'Arpan sampang Rai', 'Creative Color', 9000, 1, 0, 18, 'card'),
        ('87', '2025-04-05 18:38:50'::timestamp, 'Kinnari Usa', '9327346656', 'Nikhil Pujari', 'Color Toner', 6500, 1, 0, 18, 'card'),
        ('87', '2025-04-05 18:38:50'::timestamp, 'Kinnari Usa', '9327346656', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'card'),
        ('88', '2025-04-05 18:38:50'::timestamp, 'Priyanka Vihang Solanki', '9898718559', 'Toshi Jamir', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'gpay'),
        ('89', '2025-04-05 18:38:50'::timestamp, 'Bhaumik Gandhi', '9537555000', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('89', '2025-04-05 18:38:50'::timestamp, 'Bhaumik Gandhi', '9537555000', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('89', '2025-04-05 18:38:50'::timestamp, 'Bhaumik Gandhi', '9537555000', 'Mehul Kinariwala', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay')
    ) AS t(invoice_number, date_time, client_name, client_phone, stylist_name, service_name, service_price, quantity, discount_amount, tax_percent, payment_method)
)
SELECT 
    invoice_number,
    date_time,
    client_name,
    client_phone,
    stylist_name,
    service_name,
    service_price,
    quantity,
    discount_amount,
    tax_percent,
    payment_method,
    -- Calculate line totals
    (service_price * quantity - discount_amount) as line_total,
    ((service_price * quantity - discount_amount) * tax_percent / 100) as tax_amount
FROM raw_data;

-- Create missing clients
INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
SELECT DISTINCT 
    client_name, 
    client_phone, 
    client_phone, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE mobile_number = temp_service_data.client_phone 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create missing stylists
INSERT INTO stylists (name, user_id, available, created_at, updated_at)
SELECT DISTINCT 
    stylist_name, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    true, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM stylists 
    WHERE name = temp_service_data.stylist_name 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create missing services
INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
SELECT DISTINCT 
    service_name, 
    service_price, 
    60, 
    'service', 
    true, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM services 
    WHERE name = temp_service_data.service_name 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create merged POS orders with proper payment method formatting
WITH grouped_invoices AS (
    SELECT 
        invoice_number,
        client_name,
        client_phone,
        date_time,
        payment_method,
        -- Primary stylist (first one alphabetically)
        (array_agg(stylist_name ORDER BY stylist_name))[1] as primary_stylist,
        -- All stylists involved
        array_agg(DISTINCT stylist_name ORDER BY stylist_name) as all_stylists,
        -- Services JSON with detailed information
        jsonb_agg(
            jsonb_build_object(
                'name', service_name,
                'price', service_price,
                'quantity', quantity,
                'discount', discount_amount,
                'tax_percent', tax_percent,
                'stylist', stylist_name,
                'subtotal', service_price * quantity,
                'total', line_total,
                'tax_amount', tax_amount
            ) ORDER BY service_name
        ) as services_json,
        -- Calculate totals per payment method
        SUM(line_total) as payment_total,
        SUM(tax_amount) as payment_tax,
        COUNT(*) as service_count
    FROM temp_service_data
    GROUP BY invoice_number, client_name, client_phone, date_time, payment_method
),
final_invoices AS (
    SELECT 
        invoice_number,
        client_name,
        client_phone,
        date_time,
        primary_stylist,
        all_stylists,
        -- Merge services from all payment methods
        jsonb_agg(
            jsonb_build_object(
                'payment_method', payment_method,
                'services', services_json,
                'total', payment_total,
                'tax', payment_tax
            ) ORDER BY payment_method
        ) as payment_groups,
        -- Flatten all services
        jsonb_agg(services_json) as all_services,
        -- Payment method display string with amounts
        string_agg(
            payment_method || ' (₹' || payment_total || ')',
            ', ' ORDER BY payment_method
        ) as payment_method_display,
        SUM(payment_total) as final_total,
        SUM(payment_tax) as final_tax,
        SUM(service_count) as total_services
    FROM grouped_invoices
    GROUP BY invoice_number, client_name, client_phone, date_time, primary_stylist, all_stylists
)
INSERT INTO pos_orders (
    id,
    created_at,
    date,
    client_name,
    customer_name,
    stylist_name,
    services,
    payments,
    subtotal,
    tax,
    discount,
    total,
    total_amount,
    payment_method,
    status,
    type,
    user_id,
    notes
)
SELECT 
    uuid_generate_v4(),
    date_time,
    date_time,
    client_name,
    client_name,
    primary_stylist,
    -- Flatten all services into a single array
    (SELECT jsonb_agg(service) FROM (
        SELECT jsonb_array_elements(jsonb_array_elements(all_services)) as service
    ) flattened),
    payment_groups,
    final_total,
    final_tax,
    0, -- No discount in this data
    final_total + final_tax,
    final_total + final_tax,
    payment_method_display,
    'completed',
    'service',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    'Imported from Excel - Invoice #' || invoice_number || ' - ' || total_services || ' services - Stylists: ' || array_to_string(all_stylists, ', ')
FROM final_invoices;

-- Re-enable RLS
SET row_security = on;

-- Show import summary
SELECT 
    'Import Summary' as summary,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as stylists_involved,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid;

-- Show sample merged invoices with payment details
SELECT 
    client_name,
    payment_method,
    total_amount,
    jsonb_array_length(services) as service_count,
    notes
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
ORDER BY created_at
LIMIT 10;

-- Show invoice examples with multiple services
SELECT 
    'Multi-Service Invoices' as example_type,
    client_name,
    payment_method,
    total_amount,
    jsonb_array_length(services) as service_count,
    (SELECT string_agg(service->>'name', ', ') 
     FROM jsonb_array_elements(services) as service) as service_names
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
AND jsonb_array_length(services) > 1
ORDER BY jsonb_array_length(services) DESC
LIMIT 5; 