async function main() {
    await liff.init({ liffId: "YOUR_LIFF_ID" });

    if (!liff.isLoggedIn()) {
        liff.login();
    } else {
        const profile = await liff.getProfile();
        const userId = profile.userId;
        const urlParams = new URLSearchParams(window.location.search);
        const parameter = urlParams.get('source');

        document.getElementById('userId').textContent = userId;
        document.getElementById('parameter').textContent = parameter;

        // パラメータをサーバーに送信
        await fetch('/register/save-user-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, source: parameter })
        });

        // 友だち追加リンクにリダイレクト
        window.location.href = `https://line.me/R/ti/p/@YOUR_LINE_ID`;
    }
}
main();