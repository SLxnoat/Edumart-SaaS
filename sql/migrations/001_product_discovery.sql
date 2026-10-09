-- Product discovery migration.
-- Removes columns that an earlier, mismatched Sequelize model added to `products`
-- (several were NOT NULL without defaults and blocked inserts), then adds the
-- columns/tables used by the catalog, product detail and wishlist features.
-- Safe to run on a fresh DB created from database_schema.sql (guarded below).
USE edumart;

DROP PROCEDURE IF EXISTS edumart_001;
DELIMITER //
CREATE PROCEDURE edumart_001()
BEGIN
  DECLARE col_exists INT;
  DECLARE c VARCHAR(64);
  DECLARE done INT DEFAULT 0;
  DECLARE cur CURSOR FOR
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'products'
      AND column_name IN ('is_free','thumbnail_url','preview_images','file_attachments',
                          'is_published','moderation_feedback','download_count');
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  loop1: LOOP
    FETCH cur INTO c;
    IF done = 1 THEN LEAVE loop1; END IF;
    SET @s = CONCAT('ALTER TABLE products DROP COLUMN `', c, '`');
    PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;
  END LOOP;
  CLOSE cur;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'thumbnail_url';
  IF col_exists = 0 THEN
    ALTER TABLE products ADD COLUMN thumbnail_url VARCHAR(500) NULL;
  END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'view_count';
  IF col_exists = 0 THEN
    ALTER TABLE products ADD COLUMN view_count INT NOT NULL DEFAULT 0;
  END IF;
END//
DELIMITER ;
CALL edumart_001();
DROP PROCEDURE edumart_001;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
