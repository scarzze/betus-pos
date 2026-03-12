#!/bin/bash
PGPASSWORD=betus psql -U betus -h localhost -d betus -c "SELECT email, role, is_active FROM users LIMIT 5;"
