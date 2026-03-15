@echo off
setlocal enabledelayedexpansion

:: إعدادات الاتصال بقاعدة البيانات
set PGPASSWORD=Sa@88020401
set DATABASE=charity_db
set USER=postgres
set BACKUP_PATH=%~dp0backups
set DATE=%date:~10,4%%date:~4,2%%date:~7,2%

echo ========================================
echo بدء عملية النسخ الاحتياطي
echo ========================================

:: التأكد من وجود مجلد النسخ الاحتياطي
if not exist "%BACKUP_PATH%" (
    mkdir "%BACKUP_PATH%"
    echo تم إنشاء مجلد النسخ الاحتياطي
)

:: تحديد مسار pg_dump (تم التعديل إلى الإصدار 18)
set PGDUMP_PATH="C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

echo تم العثور على pg_dump في: %PGDUMP_PATH%

:: إنشاء النسخة الاحتياطية
echo جاري إنشاء النسخة الاحتياطية...
%PGDUMP_PATH% -U %USER% -d %DATABASE% -F c -f "%BACKUP_PATH%\backup_%DATE%.backup" 2> "%BACKUP_PATH%\error.log"

if %errorlevel% equ 0 (
    echo [تم] تم إنشاء النسخة: backup_%DATE%.backup
    del "%BACKUP_PATH%\error.log" 2>nul
) else (
    echo [خطأ] فشل إنشاء النسخة الاحتياطية
    echo راجع ملف الأخطاء: "%BACKUP_PATH%\error.log"
    type "%BACKUP_PATH%\error.log"
)

:: حذف النسخ الأقدم من 30 يوماً
if exist "%BACKUP_PATH%\*.backup" (
    forfiles -p "%BACKUP_PATH%" -m *.backup -d -30 -c "cmd /c del @path" 2>nul
    echo تم حذف النسخ الأقدم من 30 يوماً
)

echo ========================================
echo اكتملت العملية
pause