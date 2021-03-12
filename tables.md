## Tables

### <a name="things" > </a>things

| name | type | nullable ? | references |
| ---- | ---- | ---------- | ---------- |
| id<span style="color: red"> primary key </span>  | uuid | false | 
name | text | false | 
status | boolean | false | 
mood | USER-DEFINED | false |  |

### <a name="stuff" > </a>stuff

| name | type | nullable ? | references |
| ---- | ---- | ---------- | ---------- |
| thing_id | uuid | false | [things.id](#things)
id<span style="color: red"> primary key </span>  | integer | false |  |
