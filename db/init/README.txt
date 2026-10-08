Put your SQL files here. MySQL runs them once, in alphabetical order, the first
time the database volume is created.

  01-schema.sql     <- your mysqldump (all existing tables + data)
  02-hierarchy.sql  <- copy of backend/sql/002_hierarchy.sql
                       (skip it if your dump was taken AFTER you ran it)

Export from your current machine with:
  mysqldump -u root -p YOUR_DB_NAME > db/init/01-schema.sql
