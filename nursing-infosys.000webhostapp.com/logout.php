<?php
    session_start();
    session_destroy();
    echo "<script> {window.alert('登出成功');location.href='login.html'} </script>";

?>