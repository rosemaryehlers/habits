DELIMITER $$

DROP PROCEDURE IF EXISTS createTable_views $$
CREATE PROCEDURE createTable_views()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='views') THEN
        CREATE TABLE `views` (
            `id`        smallint unsigned   NOT NULL AUTO_INCREMENT,
            `name`      varchar(20)         NOT NULL COLLATE utf8_bin,
            `created`   datetime            DEFAULT CURRENT_TIMESTAMP,
            `updated`   datetime            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY (`name`)   
        ) ENGINE=InnoDB CHARSET=utf8 COLLATE=utf8_bin;
    END IF;
END $$
DELIMITER ;

CALL createTable_views();
DROP PROCEDURE createTable_views;