<?php
session_start();
if ($_SESSION["login"] == 0) {
  echo "<script> {location.href='login.html'} </script>";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>照護首頁</title>
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
    .calendar{
	width:450px;
	height:350px;
	background:#fff;
	box-shadow:0px 1px 1px rgba(0,0,0,0.1);
    }
    .body-list ul{
      width:100%;
      font-family:arial;
      font-weight:bold;
      font-size:14px;
    }
    .body-list ul li{
      width:14.28%;
      height:36px;
      line-height:36px;
      list-style-type:none;
      display:block;
      box-sizing:border-box;
      float:left;
      text-align:center;
    }
    .lightgrey{
      color:#a8a8a8; /*淺灰色*/
    }
    .darkgrey{
      color:#565656; /*深灰色*/
    }
    .green{
      color:#6ac13c; /*綠色*/
    }
    .greenbox{
      border:1px solid #6ac13c;
      background:#e9f8df; /*淺綠色背景*/
    }
  </style>
  <script>
    /*每月天數區分閏年、非閏年 */
    var month_olympic = [31,29,31,30,31,30,31,31,30,31,30,31];
    var month_normal = [31,28,31,30,31,30,31,31,30,31,30,31];
    var month_name = ["January","Febrary","March","April","May","June","July","Auguest","September","October","November","December"];

    var holder = document.getElementById("days");
    var prev = document.getElementById("prev");
    var next = document.getElementById("next");
    var ctitle = document.getElementById("calendar-title");
    var cyear = document.getElementById("calendar-year");

    /*建立Date() 得到當前年分、月份、日期 */
    var my_date = new Date();
    var my_year = my_date.getFullYear();
    var my_month = my_date.getMonth();
    var my_day = my_date.getDate();

    /*該月份的第一天是星期幾 */
    function dayStart(month, year) 
    {
      var tmpDate = new Date(year, month, 1);
      return (tmpDate.getDay());
    }

    //計算該月份的天數
    function daysMonth(month, year) 
    {
      var tmp = year % 4;
      if (tmp == 0) {
        return (month_olympic[month]);
      } else {
        return (month_normal[month]);
      }
    }

    //生成月份顯示refreshDate()
    function refreshDate(){
    var str = "";
    var totalDay = daysMonth(my_month, my_year); //該月總天數
    var firstDay = dayStart(my_month, my_year); //該月第一天是星期幾
    var myclass;
    for(var i=1; i<firstDay; i++){ 
      str += "<li></li>"; //起始日之前的空白日期
    }
    for(var i=1; i<=totalDay; i++){
      if((i<my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()) || my_year<my_date.getFullYear() || ( my_year==my_date.getFullYear() && my_month<my_date.getMonth())){ 
        myclass = " class='lightgrey'"; //該日期在今天之後，以深灰字顯示
      }else if (i==my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()){
        myclass = " class='green greenbox'"; //當天背景以深綠色背景表示
      }else{
        myclass = " class='darkgrey'"; //該日期在今天之後，以深灰字顯示
      }
      str += "<li"+myclass+">"+i+"</li>"; //日期節點
    }
    holder.innerHTML = str; //日期顯示
    ctitle.innerHTML = month_name[my_month]; //英文月份顯示
    cyear.innerHTML = my_year; //年份顯示
  }
  refreshDate();
  </script>

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
      <!--<li class="nav-item">
        <a class="nav-link" href="calender.php">行事曆</a>
      </li>-->
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

  <h1 class="container">照護首頁</h1>
  <div class="container">
      <div class="calendar">
        <div class="title">
          <h1 class="green" id="calendar-title">Month</h1>
          <h2 class="green small" id="calendar-year">Year</h2>
          <a href="" id="prev">Prev Month</a>
          <a href="" id="next">Next Month</a>
        </div>
      <div class="body">
        <div class="lightgrey body-list">
          <ul>
            <li>MON</li>
            <li>TUE</li>
            <li>WED</li>
            <li>THU</li>
            <li>FRI</li>
            <li>SAT</li>
            <li>SUN</li>
          </ul>
        </div>
        <div class="darkgrey body-list">
          <ul id="days">
          </ul>
        </div>
      </div>
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