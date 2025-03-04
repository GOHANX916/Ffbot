<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Legend bio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Press+Start+2P&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
        }
        .background-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
        }
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 0;
        }
        .enter-screen {
            font-family: 'Press Start 2P', cursive;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10;
            color: #9b59b6;
            cursor: pointer;
        }
        .main-content {
            display: none;
        }
    </style>
</head>
<body class="text-white flex flex-col items-center justify-center min-h-screen">
    <div class="enter-screen" id="enterScreen" onclick="enterSite()">
        Tap anywhere to enter
    </div>
    <video autoplay muted loop class="background-video">
        <source src="krishna.mp4" type="video/mp4">
        Your browser does not support HTML5 video.
    </video>
    <div class="overlay"></div>
    <div class="main-content relative z-10 bg-black bg-opacity-50 p-4 rounded-lg text-center max-w-xs mx-4" id="mainContent">
        <img alt="Screenshot of a mobile game with various characters and elements" class="mx-auto mb-4 rounded-full" height="80" src="https://i.postimg.cc/pV4YrvWs/1000110468-modified.png" width="80"/>
        <h1 class="text-lg font-bold text-purple-400 mb-2">ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ʟᴇɢᴇɴᴅ'ꜱ ᴇʀᴀ</h1>
        <p class="text-xs mb-4">
            ʜᴇʟʟᴏ ᴛʜɪꜱ ɪꜱ ʟᴇɢᴇɴᴅ ᴠɪᴘ ꜰꜰ ʜᴀᴄᴋꜱ ᴏᴡɴᴇʀ ʜᴇʀᴇ. ɪ'ᴠᴇ ᴏᴠᴇʀ 𝟤𝟨ᴋ ꜱᴜʙꜱᴄʀɪʙᴇʀꜱ ᴏɴ ᴛᴇʟᴇɢʀᴀᴍ ᴄʜᴀɴɴᴇʟ. ʏᴏᴜ ᴄᴀɴ ᴄᴏɴᴛᴀᴄᴛ ᴍᴇ ᴏɴ ᴛᴇʟᴇɢʀᴀᴍ ᴏʀ ᴡʜᴀᴛꜱᴀᴘᴘ. ᴏᴡɴᴇʀ ᴏꜰ ᴍᴜʟᴛɪᴘʟᴇ ᴄʜᴀɴɴᴇʟꜱ 🇮🇳. ~ʟᴇɢᴇɴᴅ🧑‍💻
        </p>
        <a class="block bg-purple-400 text-black py-2 px-4 rounded-full mb-2 text-xs" href="https://t.me/freefirehacksantiban">ᴊᴏɪɴ ᴏɴ ᴛᴇʟᴇɢʀᴀᴍ</a>
        <a class="block bg-purple-400 text-black py-2 px-4 rounded-full text-xs" href="https://wa.me/14244123712">ᴄᴏɴᴛᴀᴄᴛ ᴏɴ ᴡʜᴀᴛꜱᴀᴘᴘ</a>
    </div>
    <audio id="backgroundAudio" loop>
        <source src="end.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>
    <script>
        function enterSite() {
            document.getElementById('enterScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('backgroundAudio').play();
        }
    </script>
</body>
</html>