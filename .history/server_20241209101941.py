<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FanMa - Redirection</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
        }
        .redirect-container {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
            max-width: 200px;
            margin-bottom: 20px;
        }
        .loading {
            border: 3px solid #f3f3f3;
            border-radius: 50%;
            border-top: 3px solid #2563eb;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>

    <script>
        // Pas besoin de script de redirection complexe
        // Le serveur Python gère déjà la redirection
        console.log('Redirection handled by Python server...');
    </script>

    <!-- Fallback -->
    <noscript>
        <meta http-equiv="refresh" content="0;url=/fr/">
    </noscript>
</head>
<body>
    <div class="redirect-container">
        <img src="assets/images/logo.png" alt="FanMa Logo" class="logo">
        <h1>FanMa Expert-conseil</h1>
        <div class="loading"></div>
        <noscript>
            <p>Si vous n'êtes pas redirigé automatiquement, <a href="/fr/">cliquez ici</a>.</p>
        </noscript>
    </div>
</body>
</html>