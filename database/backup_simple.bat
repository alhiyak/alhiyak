@echo off
set PGPASSWORD=Sa@88020401
"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -U postgres -d charity_db -F c -f "%~dp0backups\backup_%date:~10,4%%date:~4,2%%date:~7,2%.backup"
echo تم إنشاء النسخة الاحتياطية
pause