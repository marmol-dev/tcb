<?php
  $contrasenha = $_POST['contrasenha'];
  $respuesta = null;

  if ($contrasenha == '1234'){
    $usuario = array('dni' => 'algo', 'otro'=>'algo');
    $respuesta = array('resultado' => $usuario);
  } else {
    $respuesta = array('error' => 'Contraseña incorrecta');
  }

  print_r(json_encode($respuesta));
?>
