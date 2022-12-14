<?php
    session_start();
    $_SESSION['p_id_number'] = NULL;
    if(isset($_GET['p_id_number'])){
      $_SESSION['p_id_number'] = $_GET['p_id_number'];
    }
    
    if($_SESSION['p_id_number'] == NULL){
        echo "<script> {window.alert('無病患資料');location.href='nurse_bed_manage.php'} </script>";
    }
    else{
        header("Location: nurse_info.php");
    }
?>    
