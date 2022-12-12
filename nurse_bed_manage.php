<?php
    session_start();
    if($_SESSION["login"] == 0){
        echo "<script> {location.href='login.html'} </script>";
    }
    $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <title>床位管理</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js"></script>

    <style>
        /* 床位顏色 */
        .white {
            background-image: url(images/white.png);
            width: 180px;
            height: 210px;
            border: 3px black solid;
        }

        .red {
            background-image: url(images/red.png);
            width: 180px;
            height: 210px;
            border: 3px black solid;
        }

        .green {
            background-image: url(images/green.png);
            width: 180px;
            height: 210px;
            border: 3px black solid;
        }

        .blue {
            background-image: url(images/blue.png);
            width: 180px;
            height: 210px;
            border: 3px black solid;
        }
        
        .color_mean {
            font-size: 30px;
            padding:5px;
            text-align:center;
            float:left;
        }
        .color_mean_container{
            width: 330px;
            height: 63px;
            margin:0px auto;
            padding-left: 10px;
        }
        /* 床位 */
        .bed {
            position: absolute;
            font-size: 25px;
            text-align:center;
            vertical-align:middle;
            top:20px;
            left:10px;
            right:10px;
        }
        /* 內文 */
        #info {
            font-size: 20px;
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-expand-sm bg-dark navbar-dark static-top">
  
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

    <h1 class="container">床位介面</h1>
    <div class="color_mean_container">
        <div class="color_mean">在床中</div>
        <div style="background-image: url(images/blue.png); width:60px; height: 60px; float:left;"></div>
        <div class="color_mean">看診中</div>
        <div style="background-image: url(images/green.png); width: 60px; height: 60px; float:left;"></div>
    </div>
    <div class="color_mean_container">
        <div class="color_mean">休息中</div>
        <div style="background-image: url(images/red.png); width: 60px; height: 60px; float:left;"></div>
        <div class="color_mean">空床中</div>
        <div style="background-image: url(images/white.png); border: 1px black solid; width:60px; height: 60px; float:left;"></div>
    </div>
    <div class="container">
        <!-- 第一列 -->
        <div class="row" style="margin:auto; border: 3px solid black;  border-radius: 10px; ">
            
            
            <?php
                $stmt = $conn ->prepare("SELECT * FROM bed_manage");
                $stmt-> execute();
                $result = $stmt->fetchAll();
                $color = "";
                for($i=1 ; $i<=4 ; $i++){
                    foreach($result as $row){
                        if($i!=$row['bed_no'])continue;
                        switch($row['p_condition']){ //判斷目前病患狀態以更改顏色
                            case "空床":
                                $color = "white";
                                break;
                            case "在床中":
                                $color = "blue";
                                break;
                            case "休息中":
                                $color = "green";
                                break;
                            case "手術中":
                                $color = "red";
                                break;
                        }
                        echo "
                        <div class='col-xs-6 col-md-3' style='margin:12px auto;width:180px;height:210px;'>
                            <div style='position: relative;width:180px;height:210px;'>
                                <input class='".$color."' type='button' onclick=".'"'."javascript:location.href='bed_manage2.php?p_id_number=".$row['id_number']."'".'"'.">
            
                                <div class='bed'>".$row['m_name']."<br> 床號：".$row['bed_no']."<br>狀態：".$row['p_condition']."</div>
                            </div>
                        </div>";
                        break;
                    }
                }
                
            ?>

        </div>

        <!-- 第二列 -->
        <div class="row" style="margin:auto; border: 3px solid black;  border-radius: 10px; ">

            <?php
                for($i=5 ; $i<=8 ; $i++){
                    foreach($result as $row){
                        if($i!=$row['bed_no'])continue;
                        switch($row['p_condition']){ //判斷目前病患狀態以更改顏色
                            case "空床":
                                $color = "white";
                                break;
                            case "在床中":
                                $color = "blue";
                                break;
                            case "看診中":
                                $color = "green";
                                break;
                            case "手術中":
                                $color = "red";
                                break;
                        }
                        echo "
                        <div class='col-xs-6 col-md-3' style='margin:12px auto;width:180px;height:210px;'>
                            <div style='position: relative;width:180px;height:210px;'>
                                <input class='".$color."' type='button' onclick=".'"'."javascript:location.href='bed_manage2.php?p_id_number=".$row['id_number']."'".'"'.">
            
                                <div class='bed'>".$row['m_name']."<br> 床號：".$row['bed_no']."<br>狀態：".$row['p_condition']."</div>
                            </div>
                        </div>";
                        break;  
                    }
                }
            ?>

        </div>
    </div>

    <!--頁尾-->
    <div style="margin-bottom: 0; margin-top:100px">
        <div>
            <p>
                © Copyright SHIH CHIEN USC ITC. All Rights Reserved.
            </p>
        </div>
    </div>
</body>

</html>