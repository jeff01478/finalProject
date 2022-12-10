<?php
session_start();
if ($_SESSION["login"] == 0) {
  echo "<script> {location.href='login.html'} </script>";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>醫護首頁</title>
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
    }

    /* 內文 */
    #info {
      font-size: 20px;
    }
  </style>

</head>

<body>

  <nav class="navbar navbar-expand-sm bg-dark navbar-dark static-top" style="margin-bottom: 30px;">

    <!-- Brand/logo -->
    <a class="navbar-brand" href="nurse_index.php">
      <img src="./images/topic.png" alt="logo" style="width:250px;">
    </a>

    <!-- Links -->
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
        <a class="nav-link" href="nurse_index.php">首頁</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="nurse_bed_manage.php">床位管理</a>
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

  <h1 class="container">醫護首頁</h1>
  <div class="container">
    <div class="row" style="margin:auto; border: 3px solid black;  border-radius: 10px; ">
      <div class="col-xs-12 col-md-4" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">醫護基本資料</p>

        <p id="info">身分別：
          <?php
            echo $identity; /*匯入資料庫身分別*/; 
          ?> 
        </p>
        <!-- 等你們改 -->
        <p id="info">帳號：
          <?php 
            $account = $_SESSION["account"];
            echo $account; /*匯入資料庫帳號*/; 
          ?> 
        </p>
        <!-- 等你們改 -->

        <p id="subtitle">負責病人</p>
        <?php
          try {
            $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
            $stmt = $conn ->prepare("SELECT * FROM responsible_nurse WHERE id_number = '".$_SESSION['id_number']."'");
            $stmt->execute();
            $result = $stmt->fetchAll();
            echo '<a id="info" href="nurse_main.php?p_id_number='.$result[0]['p1_id_number'].'">'.$result[0]['p1'].'</a><br>
                  <a id="info" href="nurse_main.php?p_id_number='.$result[0]['p2_id_number'].'">'.$result[0]['p2'].'</a><br>
                  <a id="info" href="nurse_main.php?p_id_number='.$result[0]['p3_id_number'].'">'.$result[0]['p3'].'</a><br>
                  <a id="info" href="nurse_main.php?p_id_number='.$result[0]['p4_id_number'].'">'.$result[0]['p4'].'</a><br>';
          }catch(PDOException $e ){
              echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
          }
        ?>
        
        <!-- 從資料庫匯入負責的病人 -->

      </div>
      <div class="col-xs-12 col-md-4" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">異動資訊</p>
        <p id="info"><?php echo $_SESSION['data_change_text']; /*匯入資料庫異動資訊*/; ?> </p>
        <p></p> <!-- 這邊需要資料庫 -->
      </div>
      <div class="col-xs-12 col-md-3" style="margin:12px auto ;border: 3px solid black;  border-radius: 20px;">
        <p id="subtitle">About病人</p>
        <a id="info">請先在「負責病人」處選擇病人!!</a><br>
        <br>

        <p id="subtitle">About病床</p>
        <a id="info" href="nurse_bed_manage.php">床位管理</a>
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