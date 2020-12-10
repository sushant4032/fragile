---
title: noted
created: '2020-12-09T08:47:45.955Z'
modified: '2020-12-09T15:42:13.833Z'
---

## Date formatting options with toLocaleString()
```javascript
const options = {
    year:'numeric',
    month:'short',
    day:'numeric',
    hour:'2-digit',
    minute:'2-digit'
}

const dateStrigng = new Date().toLocaleString('en-IN', options);
```
> en-IN can be replaced with defalut for automatic setting
>  



