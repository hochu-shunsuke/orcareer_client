# API定義用

## auth0とsupabaseのユーザ同期

- supabase側に送信するデータ
  - sub(Auth0からのjwtを解析して取得)
  - email
  - display_name(nickname)
  - usertype(student固定，admin側のクライアントで変更)

- 各方法での認証後，auth/profileでのauth0profileの返り値
  - google-oauth2
    - {"given_name":"manma","family_name":"cat","nickname":"buruburu454","name":"manma cat","picture":"[avatarurl]","email":"[mailaddress]","email_verified":true,"sub":"google-oauth2|11328xxxxxxxxxxxxx"}
  - 通常のメアド
    - {"nickname":"admin","name":"mailaddress","picture":"[avatarurl]","email":"[mailaddress]","email_verified":false,"sub":"auth0|68275a1db13b8xxxxxxxxxx"}
  - apple
    - {"nickname":"","name":"","picture":"[avatarurl]","sub":"apple|000568.94xxxxxxxxxx"}