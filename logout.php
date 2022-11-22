<?php
    session_start();
    $_SESSION["login"] = null;
    $_SESSION["permission"] = null;
    $_SESSION["name"] = null;
    $_SESSION["identity"] = null;
    $_SESSION["account"] = null;
    echo "<script> {window.alert('登出成功');location.href='login.html'} </script>";

?>