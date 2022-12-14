<?php
    session_start();
    if ($_SESSION["login"] == 0) {
    echo "<script> {location.href='login.html'} </script>";
    }
    if(isset($_GET['p_id_number'])){ //避免醫護端與病人端(照服員與家屬)衝突，需做區分
        $id_number = $_GET['p_id_number'];
    }

    $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
    $stmt = $conn ->prepare("SELECT ward_no FROM patient_admission_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $ward_no = $stmt->fetchAll()[0][0]; //房號

    $stmt = $conn ->prepare("SELECT bed_no FROM patient_admission_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $bed_no = $stmt->fetchAll()[0][0]; //床號

    $stmt = $conn ->prepare("SELECT m_name FROM patient_basic_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $p_name = $stmt->fetchAll()[0][0]; //病患姓名

    $stmt = $conn ->prepare("SELECT chart_no FROM patient_basic_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $chart_no = $stmt->fetchAll()[0][0]; //病例號

    $stmt = $conn ->prepare("SELECT gender FROM patient_basic_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $gender = $stmt->fetchAll()[0][0]; //性別

    $stmt = $conn ->prepare("SELECT blood FROM patient_basic_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $blood = $stmt->fetchAll()[0][0]; //血型

    $stmt = $conn ->prepare("SELECT attending_physician FROM patient_admission_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $physician = $stmt->fetchAll()[0][0]; //醫師

    $stmt = $conn ->prepare("SELECT nurse FROM patient_admission_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $nurse = $stmt->fetchAll()[0][0]; //護理師

    $stmt = $conn ->prepare("SELECT hospitalization_date FROM patient_admission_info WHERE id_number='".$id_number."'");
    $stmt-> execute();
    $date = $stmt->fetchAll()[0][0]; //入院時間
    
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>資訊病床卡</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <script type='text/javascript' src='http://cdn.staticfile.org/jquery/2.1.1/jquery.min.js'></script>
    <script type="text/javascript" src="http://cdn.staticfile.org/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>

    <style>
        #bed{
            width: 300px;
            height: 100px;
            border: 5px solid blue;
            text-align:center;
            line-height:50px;
            position:absolute;
            font-size: 30px;
            font-weight:bold;
        }
        .locate{
            width: 550px;
            height: 100px;
            border: 5px solid blue;
            padding-left: 10px;
            margin:0px auto;
        }
        .locate p1{
            float:left;
            margin-right:10px;
            text-align:center;
            line-height:90px;
            font-size: 50px;
            font-family:標楷體;
            font-weight:bold;
        }
        .locate p2{
            float:right;
            margin-right:10px;
            text-align:center;
            line-height:50px;
            font-size: 30px;
            font-family:標楷體;
            font-weight:bold;
        }
        .info1{
            width: 700px;
            height: 300px;
            margin-left:150px;
        }
        .info1 p1{
            float:left;
            font-size: 200px;
            font-family:標楷體;
            letter-spacing: 30px;
        }
        .info1 p2{
            margin-left: 50px;
            float:left;
            color: rgb(50, 59, 61);
            font-size: 40px;
            font-weight:bold;
            font-family:微軟正黑體;
            position: absolute; 
            bottom: 300px;
        }
        .info2{
            margin-left:150px;
            margin-top: 100px;
            width: 800px;
            height: 100px;
            font-size: 50px;
            font-family:標楷體;
            letter-spacing: 10px;
        }
    </style>
</head>

<body>
<nav class="navbar navbar-expand-sm bg-dark navbar-dark static-top">
  
  <!-- Brand/logo -->
  <a class="navbar-brand" href="#">
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
      <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                    家屬資本資料
                </a>
                <div class="dropdown-menu">
                    <a class="dropdown-item" href="nurse_info.php">基本資料</a>
                    <a class="dropdown-item" href="nurse_bodydata.php">身體數據</a>
                    </div>
      </li>
      <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                    檢查日程
                </a>
                <div class="dropdown-menu">
                    <a class="dropdown-item" href="nurse_med_time.php">用藥時間</a>
                    <a class="dropdown-item" href="nurse_ward_round.php">查房時間</a>
                </div>
      </li>
</ul>

<div style="margin-right:10px ;text-align:right; color:white;" class="col-xs-12 col-md-2">
      <?php $a = 1;
        $name = $_SESSION["name"];
        $identity = $_SESSION["identity"]; 
        echo "姓名：" . $name . "<br>身分別：" . $identity /*匯入資料庫姓名、身分別*/;
      ?>
    </div>
    <form  id="login" method="POST" action="logout.php">
      <input class="btn btn-warning" type="submit" value="登出">
    </form>
</nav>
<p></p>
<div style="position:relative; width: 1400px;0px; height: 830px; border:5px rgb(52, 183, 220) solid;padding: 20px; margin: 0 auto;">
        <div id="bed">房號:<?php echo $ward_no;?><br>床號：<?php echo $bed_no;?></div>
        <div class="locate"><p1>旗山長照</p1><p2><iframe href="#" src="https://www.zeitverschiebung.net/clock-widget-iframe-v2?language=en&size=small&timezone=Asia%2FTaipei" width="100%" height="90" frameborder="0" seamless></iframe> </p2></div>
        <div style="margin: 20px;font-size: 30px; font-weight:bold;">編號：<?php echo $chart_no;?></div>
        <div class="info1"><p1><?php echo $p_name?></p1><p2>性別：<?php echo $gender;?><br>年齡：80y2m<br>血型：<?php echo $blood;?></p2></div>
        <div class="info2">
            主治醫師：<?php echo $physician;?><br>
            主護理師：<?php echo $nurse;?><br>
            入住時間：<?php echo $date;?>
        </div>
        <!-- QRcode產生 -->
        <div id="qrcode" style="float:right; position: absolute; bottom: 50px; right: 100px;">
            <p style="color:dodgerblue; font-size: 45px; margin-bottom: 0;font-weight:bold;font-family:微軟正黑體;">詳細資訊</p>
            <script>
                $('#qrcode').qrcode({ width: 180, height: 180, text: "http://nursing-infosys.epizy.com/login.html" });
            </script>
        </div>
    </div>
    
</body>

</html>