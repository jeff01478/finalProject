<?php
  session_start();
  try {
    $conn = new PDO("mysql:host=localhost;dbname=bed_information_system", "root", "");
    $stmt = $conn ->prepare("SELECT nurse FROM patient_admission_info WHERE name='".$_SESSION['name']."'");
    $stmt-> execute();
    $nurse = $stmt->fetchAll()[0][0]; //護理師
    $stmt = $conn->prepare("SELECT * FROM body_data WHERE name='".$_SESSION['name']."'");
    $stmt->execute();
    $result = $stmt->fetchAll();
  } catch (PDOException $e) {
    echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
  }
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>衛教資訊</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>

  <style>
    
    
  </style>

</head>

<body>

  <nav class="navbar navbar-expand-sm bg-dark navbar-dark static-top" style="margin-bottom: 30px;">

    <!-- Brand/logo -->
    <a class="navbar-brand" href="patient_main.php">
      <img src="./images/topic.png" alt="logo" style="width:250px;">
    </a>

    <!-- Links -->
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
        <a class="nav-link" href="patient_main.php">首頁</a>
      </li>

      <!-- Dropdown -->
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
          病人資本資料
        </a>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="patient_info.php">基本資料</a>
          <a class="dropdown-item" href="#">身體數據</a>
          <a class="dropdown-item" href="patient_bed_card.php">檢視病床卡</a>
        </div>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="patient_med_time.php">用藥時間</a>
        
      </li>
      <li class="nav-item">
        <a class="nav-link" href="patient_health_education.php">衛教資訊</a>
      </li>
    </ul>

    <div style="margin-right:10px ;text-align:right; color:white;" class="col-xs-12 col-md-2">
      <?php 
        $name = $_SESSION["name"];
        $identity = $_SESSION["identity"]; 
        echo "姓名：" . $name . "<br>身分別：" . $identity /*匯入資料庫姓名、身分別*/;
      ?>
    </div>

    <form  id="login" method="POST" action="logout.php">
      <input class="btn btn-warning" type="submit" value="登出">
    </form>
  </nav>
  <h1 style="margin: 10px 50px;">衛教資訊</h1>
  <p></p>

  <div class="container">
    <!--防跌須知-->
        <h4 style="margin: 10px 50px; ">防跌須知</h4>
  <div class="row"style="height: 5px; background-color:yellow;"></div>
  <div class="row">
            <div class="col-md-6" style="height: 40px; border-color:yellow;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/26e92e37276e86374a0f0f2811fc81df.pdf" style="color: #000000">中文與越南文版(來源：臺中醫院)</a>
            </div>
            <div class="col-md-6" style="height: 40px; border-color:yellow;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/0988befd588cae8526d6a9ee2ff9996b.pdf" style="color: #000000">中文與印尼文版(來源：臺中醫院)</a>
            </div>
    </div>
        <p></p>
        <div class="row">
            <div class="col-md-6" style="height: 40px; border-color:yellow;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/d06336b38430f7c2a80eadd77e852549.pdf" style="color: #000000">中文與英文版(來源：臺中醫院)</a>
        </div><br>
    </div>

  <!--胸腔內科-->
    <h4 style="margin: 10px 50px; ">胸腔內科</h4>
        <div class="row"style="height: 5px; background-color:blue;">
        </div>
        <p></p>
        <div class="row">
            <div class="col-md-6" style="height: 40px; border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/66faa778cb0efcc6a80d16053344d9ec.pdf" style="color: #000000">膿胸(來源：臺中醫院)</a>
            </div>
            <div class="col-md-6" style=" height: 40px;border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/80444866521d7949ba9b248ab404af5a.pdf" style="color: #000000">氣切照護(來源：臺中醫院)</a>
            </div>
        </div>
        <p ></p>
        <div class="row">
            <div class="col-md-6" style="height: 40px; border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/910961300b1b75834699cb4c81aa0d49.pdf" style="color: #000000">懷孕婦女氣喘的治療(來源：臺中醫院)</a>
            </div>
            <div class="col-md-6" style="height: 40px; border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/fb19328e34963c8653b5a6ea62db0361.pdf" style="color: #000000">高氧氣治療(來源：臺中醫院)</a>

            </div>
        </div>
        <p></p>
        <div class="row">
            <div class="col-md-6" style="height: 40px; border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/69a0a2ceef253a5ec58582163ed85e8f.pdf" style="color: #000000">固定劑量組合(fixed-dose combination, FDC)處方和分開藥物(separate 
tablets)處方的比較(來源：臺中醫院)</a>
            </div>
            <div class="col-md-6" style="height: 40px; border-color:blue;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
            <a href="https://www.taic.mohw.gov.tw/public/hygiene/c03f6d5695b22120f936f1139d83a516.pdf" style="color: #000000">肺癌篩檢(來源：臺中醫院)</a>
            </div>
        </div><br>

    <!--神經內科-->
        <h4 style="margin: 10px 50px; ">神經內科</h4>
    <div class="row"style="height: 5px; background-color:green;">
    </div>
    <p></p>
    <div class="row">
        <div class="col-md-6" style="height: 40px; border-color:green;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
        <a href="https://www.taic.mohw.gov.tw/public/hygiene/57d6596dce6918d614dbeedab3b3767e.pdf" style="color: #000000">預防中風(來源：臺中醫院)</a>
        </div>
        <div class="col-md-6" style=" height: 40px;border-color:green;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
        <a href="https://www.taic.mohw.gov.tw/public/hygiene/70198c8383a410a11fd94b85aa73a5a9.pdf" style="color: #000000">頸動脈剝離導致腦中風(來源：臺中醫院)</a>
        </div>
    </div>
    <p ></p>
    <div class="row">
        <div class="col-md-6" style="height: 40px; border-color:green;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
        <a href="https://www.taic.mohw.gov.tw/public/hygiene/b47d07ae4be0a4a57aed8767efa33d70.pdf" style="color: #000000">突發眩暈、噁心嘔吐可能是中風了(來源：臺中醫院)</a>
        </div>
        <div class="col-md-6" style="height: 40px; border-color:green;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
        <a href="https://www.taic.mohw.gov.tw/public/hygiene/30ce8cfbb3f1f69bf81707a9be30d1ab.pdf" style="color: #000000">顏面神經麻痺之復健(來源：臺中醫院)</a>
        </div>
    </div>
    <p></p>
    <div class="row">
        <div class="col-md-6" style="height: 40px; border-color:green;border-style:solid;border-width:0px 0px 0px 3px;padding: 10px;">
        <a href="https://www.taic.mohw.gov.tw/public/hygiene/3a53bdace67dcced1c72db8d0ee85196.pdf" style="color: #000000">顏面神經麻痺(貝爾氏麻痺)(來源：臺中醫院)</a>
        </div>
    </div><br>
    </div>
  <!--頁尾-->
  <div>
    <div>
      <p>
        © Copyright SHIH CHIEN USC ITC. All Rights Reserved.
      </p>
    </div>
  </div>


</body>

</html>