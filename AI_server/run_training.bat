@echo off
cd /d "C:\20213507_서유진\학과공부\졸업작품\AI_server"
set PYTHONIOENCODING=utf-8
echo 학습 시작: %date% %time% > training_log.txt
python train_model.py --data_dir "../models" --utkface_dir "../models/UTKFace" >> training_log.txt 2>&1
echo 학습 완료: %date% %time% >> training_log.txt
pause
