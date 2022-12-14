<?php
session_start();
if ($_SESSION["login"] == 0) {
    echo "<script> {location.href='login.html'} </script>";
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <title>負責對象首頁</title>
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

        /* 表格 */


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

        #info th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: darkslateblue;
            color: white;
        }
        /* 輸入欄 */
        #textinput {
            background:#ccc; border:0 none;
            -webkit-border-radius: 5px;
            border-radius: 5px; 
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

            <!-- Dropdown -->
            <li class="nav-item">
        <a class="nav-link" href="nurse_bed_manage.php">床位管理</a>
      </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                    對象基本資料
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
    <h1 style="margin: 10px 50px;">基本資料</h1>
    <div class="container">
        <div class="col-xs-14 col-md-14" style="margin:12px auto ;">
            <table id="info">
                <tr>
                    <th width="100px"></th>
                    <th style="width:400px;min-width:150px">資料項目</th>
                    <th style="width:400px;min-width:130px">內容</th>
                    <th>備註</th>
                </tr>

                <tr>
                    <td rowspan="9" style="background-color:aliceblue;padding-left: 20px;padding-right: 20px;font-size:30px;text-align: center;">
                        基<br>本<br>資<br>料
                    </td>
                    <?php
                        try {
                            $conn = new PDO("mysql:host=localhost;dbname=access_test", "root", "");
                            $stmt = $conn->prepare("SELECT * FROM patient_basic_info where id_number = '".$_SESSION['p_id_number']."'");
                            $stmt->execute();
                            $row = $stmt->fetch();
                        } catch (PDOException $e) {
                            echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
                        }
                        $basic = array(
                            "身分證字號<br>ID Number", "病歷號碼<br>Chart No.", "姓名<br>Name", "性別<gender>", "出生日期<br>Birth Date", "血型<br>Blood Type",
                            "D抗原性<br>Rh Type", "重大傷病<br>Major illness", "過敏史<br>History of allergies"
                        );

                        $j = 0;
                        for ($i = 0; $i < count($basic) * 2; $i += 2) {
                            echo "<td>" . $basic[$j] . "</td><td>" . $row[$i] . "</td><td>" . $row[$i + 1] . "</td></tr><tr>";
                            $j += 1;
                        }
                    ?>
            </table>
        </div>

        <div class="col-xs-14 col-md-14" style="margin:12px auto ;">
            <form method="POST" action="change_data.php">
                <table id="info">
                    <tr>
                        <th width="100px"></th>
                        <th style="width:400px;min-width:150px">資料項目</th>
                        <th style="width:400px;min-width:130px">內容</th>
                        <th>備註</th>
                    </tr>
                    <tr>
                        <td rowspan="11" style="background-color:aliceblue;padding-left: 20px;padding-right: 20px;font-size:30px;text-align: center;">
                            入<br>院<br>資<br>料
                        </td>
                        <?php
                            try {
                                $stmt = $conn->prepare("SELECT * FROM patient_admission_info where id_number= '".$_SESSION['p_id_number']."'");
                                $stmt->execute();
                                $row = $stmt->fetch();
                            } catch (PDOException $e) {
                                echo "資料庫連結失敗! 錯誤訊息為 " . $e->getMessage();
                            }
                            $basic = array(
                                "病房號<br>Ward No.", "病床號<br>Bed No.", "聯絡電話<br>Phone No.", "地址<br>Address", "緊急聯絡人(關係)<br>Emergency Contact",
                                "緊急聯絡人電話<br>Emergency Contact No.", "住院日期<br>Hospitalization Date", "留觀時間<br>Observation Time", "主治醫師<br>Attending Physician",
                                "護理師<br>Nurse", "目前病況<br>Current Condition"
                            );
                            $dis = "disabled";
                            if(is_array($_GET)&&count($_GET)>0)//判斷是否有Get引數
                            {
                                if(isset($_GET['dis']))//判斷所需要的引數是否存在，isset用來檢測變數是否設定，返回true or false
                                {
                                    $dis=$_GET['dis'];//存在
                                }
                            }else {$dis = "disabled";}//若無Get引數
                            $j = 0;
                            $s = 1;
                            for ($i = 1; $i < count($basic) * 2; $i += 2) {
                                echo '<td>'. $basic[$j] .'</td>
                                <td><input type="text" name="info'.$s.'"style="width:100%;min-width:120px" id="textinput" '.$dis.' value="'.$row[$i].'"</td>
                                <td><input type="text" name="info'.($s+1).'" style="width:100%;min-width:115px" id="textinput" '.$dis.' value="'.$row[($i+1)].'"></td></tr><tr>';
                                $j += 1;
                                $s += 2;
                            }
                        ?>
                    </tr>
                </table>
        </div>
            <input 
                type=
                    <?php 
                        if(is_array($_GET)&&count($_GET)>0)//判斷是否有Get引數
                        {
                            if(isset($_GET['dis']))//判斷所需要的引數是否存在，isset用來檢測變數是否設定，返回true or false
                                echo "submit";
                        }
                        else 
                            echo "button";//無Get引數 ?>
                style="float:right;font-size:30px;width:150px;height:50px;" name="test" 
                value=
                    <?php 
                        if(is_array($_GET)&&count($_GET)>0)//判斷是否有Get引數
                        {
                            if(isset($_GET['dis']))//判斷所需要的引數是否存在，isset用來檢測變數是否設定，返回true or fals
                                echo "儲存資料";
                        }
                        else 
                            echo "更動資料";//無Get引數
                    ?> 
                onclick=
                    <?php 
                        if(is_array($_GET)&&count($_GET)>0){//判斷是否有Get引數
                            if(isset($_GET['dis'])){}//判斷所需要的引數是否存在，isset用來檢測變數是否設定，返回true or false
                        }
                        else 
                            echo "location.href='nurse_info.php?dis='";//無Get引數
                    ?> 
            />
            <br/>
            <input type="hidden" name="data" value="<?php echo $j; ?>">  
            </form>
    </div>
    
    <div class="container">
        <div class="col-xs-14 col-md-14" style="margin:30px auto ;border: 3px solid black;  border-radius: 10px;">
            <div style="margin-left:20px;">
                <p id="subtitle" style="color:crimson;">異動資訊</p>
                <p id="info"><?php echo "" /*匯入資料庫異動資訊*/; ?> </p>
                <p></p> <!-- 這邊需要資料庫 -->
            </div>
        </div>
    </div>
    <!--頁尾-->
    <div>
        <div>
            <p>
                <!-- © Copyright SHIH CHIEN USC ITC. All Rights Reserved. -->
            </p>
        </div>
    </div>
</body>

</html>