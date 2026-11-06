<?php
session_start();
try {
  $conn = new PDO("mysql:host=localhost;dbname=id20011523_nursing", "id20011523_admin", "O&Zp}A5LWd%ARi/8");
  $stmt = $conn->prepare("SELECT * FROM body_data WHERE id_number='".$_SESSION['p_id_number']."'");
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
      text-align: left;
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

<nav class="navbar navbar-expand-sm bg-dark navbar-dark staic-top">
  
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
    <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbardrop" data-toggle="dropdown">
                    基本資料
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

  <h1 style="margin: 10px 50px;">身體數據</h1>
  <form method="POST" action="nurse_bodydata2.php"> 
  <div class="border_1">
    <table id="info">
      <tr>
        <th style="width: 25%;">日期時間</th>
        <th style="width: 25%;">體溫</th>
        <th style="width: 25%;">護理師</th>
        <th style="width: 25%;">備註</th>
      </tr>
      <tr>
        <td>
          <div id="show_time">  
            <script>  
              //這裡程式碼多了幾行，但是不會延遲顯示，速度比較好，格式可以自定義，是理想的時間顯示
              setInterval("fun(show_time)",1);
              function fun(timeID){ 
                var date = new Date();  //建立物件  
                var y = date.getFullYear();     //獲取年份  
                var m =date.getMonth()+1;   //獲取月份  返回0-11  
                var d = date.getDate(); // 獲取日  
                var w = date.getDay();   //獲取星期幾  返回0-6   (0=星期天) 
                var ww = ' 星期'+'日一二三四五六'.charAt(new Date().getDay()) ;//星期幾
                var h = date.getHours();  //時
                var minute = date.getMinutes()  //分
                var s = date.getSeconds(); //秒
                if(m<10){
                  m = "0"+m;
                }
                if(d<10){
                  d = "0"+d;
                }
                if(h<10){
                  h = "0"+h;
                }
                
                
                if(minute<10){
                  minute = "0"+minute;
                }
                
                
                if(s<10){
                  s = "0"+s;
                }
                
                document.getElementById(timeID.id).innerHTML =  y+"-"+m+"-"+d+" ("+ww+")"+"   "+h+":"+minute+":"+s;
                //document.write(y+"-"+m+"-"+d+"   "+h+":"+minute+":"+s); 
                document.getElementById('date').value = y+"-"+m+"-"+d+" ("+ww+")"+"   "+h+":"+minute+":"+s; 
                document.getElementById('date2').value = y+"-"+m+"-"+d+" ("+ww+")"+"   "+h+":"+minute+":"+s;
              }
            </script>  
            </div>  </td>
            <input id="date" type="hidden" name="date" />
        <td><input type="text" class="form-control" name="temperature"></td>
        <td><?php echo $name;?></td>
        <td><input type="text" class="form-control" name="remark"></td>
      </tr>
    </table>
    <p></p>
          <input type="submit" value="提交" style="float:right">
  </form>
          <form method="POST" action="nurse_bodydata4.php">
            <input type="submit" value="體溫測量" style="float:right">
            <input id="date2" type="hidden" name="date" />
          </form>
    </div>
  <h1 style="margin: 10px 50px;">歷史紀錄</h1>
  <div class="border_1">
    
    <table id="info">
      <tr>
        <th style="width: 25%;">日期時間</th>
        <th style="width: 25%;">體溫</th>
        <th style="width: 25%;">護理師</th>
        <th style="width: 25%;">備註</th>
      </tr>
    </tr>
    <?php
    foreach ($result as $row) {
      echo "<tr><td>" . $row['m_date'] . "</td><td>" . $row['T'] . "</td><td>" . $name. "</td><td>" . $row['remark'] . "</td></tr>";
    }
    ?>
  </table>
      
  </div>
  
</body>
<!--頁尾-->





</html>
