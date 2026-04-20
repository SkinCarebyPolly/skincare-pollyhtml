# Regras do Firestore — copiar no Firebase Console

Vá em: Firestore Database → Regras → cole o conteúdo abaixo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /protocolos/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /evolucao/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
