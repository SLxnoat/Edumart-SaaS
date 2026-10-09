-- Demo catalog data for local development (uses the first existing user as seller).
USE edumart;

INSERT IGNORE INTO product_categories (id, name, description, level, sort_order, is_active, created_at, updated_at) VALUES
 (1,'Mathematics','Past papers, workbooks and notes',0,1,1,NOW(),NOW()),
 (2,'Biology','Revision notes and practice papers',0,2,1,NOW(),NOW()),
 (3,'Chemistry','Exam practice and study packs',0,3,1,NOW(),NOW()),
 (4,'Physics','Formula sheets and model papers',0,4,1,NOW(),NOW()),
 (5,'English','Literature guides and language packs',0,5,1,NOW(),NOW()),
 (6,'History','Notes and essay guides',0,6,1,NOW(),NOW());

SET @seller = (SELECT id FROM users ORDER BY created_at LIMIT 1);

INSERT IGNORE INTO products
 (id, seller_id, category_id, title, description, short_description, price, original_price, sku, subject, grade_level, exam_year,
  product_type, format, is_downloadable, is_shippable, stock_quantity, rating_average, rating_count, is_featured, is_active, is_approved)
VALUES
 ('00000000-0000-4000-8000-000000000001',@seller,1,'Algebra 1 Past Papers Bundle','Ten years of Algebra past papers with worked marking schemes.','Algebra past papers with marking schemes',29.99,39.99,'MATH-001','Mathematics','Grade 9',2023,'past_paper','digital',1,0,0,4.80,124,1,1,1),
 ('00000000-0000-4000-8000-000000000002',@seller,2,'Biology Revision Notes','Concise chapter-by-chapter revision notes.','Chapter-by-chapter notes',19.99,NULL,'BIO-001','Biology','Grade 10',2023,'revision_notes','digital',1,0,0,4.50,89,0,1,1),
 ('00000000-0000-4000-8000-000000000003',@seller,3,'Chemistry Exam Practice','Topic-wise practice questions with answers.','Topic-wise practice questions',24.99,29.99,'CHEM-001','Chemistry','Grade 11',2023,'model_paper','digital',1,0,0,4.20,67,0,1,1),
 ('00000000-0000-4000-8000-000000000004',@seller,4,'Physics Formulas Sheet','Every formula you need on four pages.','All key formulas',9.99,NULL,'PHY-001','Physics','Grade 12',2023,'revision_notes','digital',1,0,0,4.60,156,1,1,1),
 ('00000000-0000-4000-8000-000000000005',@seller,5,'English Literature Study Guide','Study guide covering set texts and essay technique.','Set texts and essay technique',14.99,NULL,'ENG-001','English','Grade 10',2024,'ebook','digital',1,0,0,4.30,78,0,1,1),
 ('00000000-0000-4000-8000-000000000006',@seller,1,'Math Problem Solving Workbook','Printed workbook of graded problems.','Graded problem workbook',22.99,NULL,'MATH-002','Mathematics','Grade 8',2023,'other','physical',0,1,25,4.70,103,0,1,1),
 ('00000000-0000-4000-8000-000000000007',@seller,1,'Geometry Practice Worksheets','Printable geometry worksheets.','Geometry worksheets',19.99,NULL,'MATH-003','Mathematics','Grade 9',2022,'model_paper','digital',1,0,0,4.30,67,0,1,1),
 ('00000000-0000-4000-8000-000000000008',@seller,6,'History Essay Guide','Model essays and structure tips.','Model essays and tips',12.99,NULL,'HIST-001','History','Grade 11',2022,'lecture_pack','digital',1,0,0,4.10,41,0,1,1);

INSERT IGNORE INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_uses, created_by, is_active)
VALUES ('00000000-0000-4000-8000-0000000000c1','WELCOME10','10% off your order','percentage',10,0,0,@seller,1);
