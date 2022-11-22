<?php
    session_start();
    $_SESSION['patient'] = NULL;
    if(isset($_GET['patient'])){
      $_SESSION['patient'] = $_GET['patient'];
    }
    
    if($_SESSION['patient'] == NULL){
        echo "<script> {window.alert('無病患資料');location.href='nurse_bed_manage.php'} </script>";
    }
    else{
        header("Location: nurse_info.php");
    }
?>    
