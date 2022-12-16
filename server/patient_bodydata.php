<?php
  session_start();
  try {
    $conn = new PDO("mysql:host=localhost;dbname=id20011523_nursing", "id20011523_admin", "O&Zp}A5LWd%ARi/8");
    $stmt = $conn ->prepare("SELECT nurse FROM patient_admission_info WHERE id_number='".$_SESSION['id_number']."'");
    $stmt-> execute();
    $nurse = $stmt->fetchAll()[0][0]; //護理師
    $stmt = $conn->prepare("SELECT * FROM body_data WHERE id_number='".$_SESSION['id_number']."'");
    $stmt->execute();
    $result = $stmt->fetchAll();
  } catch (PDOException $e) {
    echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
  }
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>身體數據</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>

  <style>
    .border_1 {
      margin-bottom: 100px;
      margin-left: 50px;
      margin-right: 50px;
      border-width: 3px;
      border-style: none;
      border-color: black;
      padding: 5px;
    }

    #info {
      font-family: Arial, Helvetica, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }

    #info td,
    #info th {
      border: 1px solid #ddd;
      padding: 8px;
    }

    #info tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    #info tr:hover {
      background-color: #ddd;
    }

    #info th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #04AA6D;
      color: white;
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

  <h1 style="margin: 10px 50px;">身體數據</h1>

  <div class="border_1">
    <table id="info">
      <tr>
        <th>日期時間</th>
        <th>體溫</th>
        <th>照服員</th>
        <th>備註</th>
      </tr>
      <?php
      foreach ($result as $row) {
        echo "<tr><td>" . $row['m_date'] . "</td><td>" . $row['T'] . "</td><td>" . $nurse . "</td><td>" . $row['remark'] . "</td></tr>";
      }
      ?>
    </table>
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