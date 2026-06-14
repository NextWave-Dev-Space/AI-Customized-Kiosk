@echo off
REM Directory containing your .h5 model files
SET "MODEL_DIR="C:\20213507_서유진\학과공부\졸업작품\프론트엔드\fastfood-kiosk\src\components\models""

echo Converting models in %MODEL_DIR%

REM Loop through each .h5 file in the directory
FOR %%f IN ("%MODEL_DIR%\*.h5") DO (
    REM Extract the base name of the file (without extension)
    SET "base_name=%%~nf"
    echo Processing file %%f with base name %base_name%
    
    REM Create the output directory name
    SET "output_dir=%MODEL_DIR%\%base_name%_tfjs"
    echo Output directory: %output_dir%
    
    REM Run the TensorFlow.js converter
    tensorflowjs_converter --input_format keras "%%f" "%output_dir%"
)

echo Conversion complete!
pause
