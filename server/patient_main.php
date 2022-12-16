<?php
  session_start();
  if ($_SESSION["login"] == 0) {
    echo "<script> {location.href='login.html'} </script>";
  }
  $conn = new PDO("mysql:host=localhost;dbname=id20011523_nursing", "id20011523_admin", "O&Zp}A5LWd%ARi/8");
?>

<!-- 還需要一個判斷是否有選擇病人，沒有的話要回到nurse_index.php -->

<!DOCTYPE html>
<html lang="en">

<head>
  <title>病床護理資訊系統</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>

  <style>
    /* 副標題 */
    #subtitle {
      font-size: 30px;
      font-weight:bold;
    }

    /* 內文 */
    #info {
      font-size: 20px;
      font-family:微軟正黑體;
      font-weight:bold;
      text-align:left;
    }
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
                  對象基本資料
              </a>
              <div class="dropdown-menu">
                  <a class="dropdown-item" href="patient_info.php">基本資料</a>
                  <a class="dropdown-item" href="patient_bodydata.php">身體數據</a>
                  <!-- <a class="dropdown-item" href="patient_bed_card.php">檢視病床卡</a> -->
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

  <h1 class="container">病床護理資訊系統</h1>
  <div class="container">
    <div class="row" style="margin:auto; border: 3px solid black;  border-radius: 10px; ">
      <div class="col-xs-12 col-md-4" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">基本資料</p>

        <p id="info">姓名：<?php echo $_SESSION['name'] /*匯入資料庫*/; ?> </p>
        <!-- 等你們改 -->
        <p id="info">房號：
        <?php 
          $stmt = $conn ->prepare("SELECT ward_no FROM patient_admission_info WHERE id_number='".$_SESSION['id_number']."'");
          $stmt-> execute();
          $result =  $stmt->fetchAll()[0][0];
          echo $result;
        ?> 
        </p>
        <!-- 等你們改 -->
        <p id="info">床號：
        <?php 
          $stmt = $conn ->prepare("SELECT bed_no FROM patient_admission_info WHERE id_number='".$_SESSION['id_number']."'");
          $stmt-> execute();
          $result =  $stmt->fetchAll()[0][0];
          echo $result; 
        ?> 
        </p>
        <!-- 等你們改 -->
        <p id="info">主治醫師：
        <?php 
          $stmt = $conn ->prepare("SELECT attending_physician FROM patient_admission_info WHERE id_number='".$_SESSION['id_number']."'");
          $stmt-> execute();
          $result =  $stmt->fetchAll()[0][0];
          echo $result; 
        ?> 
        </p>
        <!-- 等你們改 -->
        <p id="info">主護護理師：
        <?php 
          $stmt = $conn ->prepare("SELECT nurse FROM patient_admission_info WHERE id_number='".$_SESSION['id_number']."'");
          $stmt-> execute();
          $result =  $stmt->fetchAll()[0][0];
          echo $result; 
        ?> 
        </p>
        <!-- 等你們改 -->
      </div>
      <div class="col-xs-12 col-md-4" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">異動資訊</p>
        <p id="info"><?php echo "" /*匯入資料庫異動資訊*/; ?> </p>
        <p></p> <!-- 這邊需要資料庫 -->
      </div>
      <div class="col-xs-12 col-md-3" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">About自己</p>
        <a id="info" href="patient_info.php">基本資料</a><br>
        <a id="info" href="patient_bodydata2.php">身體數據</a><br>
        <a id="info" href="patient_med_time.php">用藥時間</a>

        <!-- <p id="subtitle">About床位</p>
        <a id="info" href="patient_bed_card.php">檢視病床卡</a><br> -->
      </div>
    </div>
  </div>

  <!--頁尾-->
  <div style="margin-bottom: 0; margin-top:100px">
    <div>
      <p>
        <!-- © Copyright SHIH CHIEN USC ITC. All Rights Reserved. -->
      </p>
    </div>
  </div>


</body>

</html>