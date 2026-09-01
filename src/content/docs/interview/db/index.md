---
title: DB 면접 질문 100선
description: 신입·주니어 백엔드 면접에서 자주 다루는 데이터베이스 100개 질문과 답변을 주제별로 정리합니다.
slug: interview/db
contentType: page
sidebar:
  order: 1
---

아래 답변은 **신입·주니어 백엔드 기술면접에서 1~2분 안에 설명할 수 있는 수준**으로 정리했다. 문장을 그대로 외우기보다 `정의 → 동작 원리 → 트레이드오프 → 실무 연결` 흐름으로 답하는 연습에 초점을 둔다.

공통 개념은 특정 버전에 종속되지 않도록 설명한다. 구현 차이가 중요한 내용은 **MySQL 8.4의 InnoDB와 PostgreSQL 18**을 기준으로 구분한다.

## 질문 분류

1. [Database / RDB 기본 — 1~15번](./database-rdb-basics/)
2. [SQL — 16~30번](./sql/)
3. [Index — 31~50번](./indexes/)
4. [실행 계획 / 성능 — 51~60번](./execution-plan-performance/)
5. [Transaction / ACID — 61~80번](./transactions-acid/)
6. [Lock / Concurrency / MVCC — 81~90번](./locks-concurrency-mvcc/)
7. [MySQL / PostgreSQL 내부 구조와 실무 — 91~100번](./mysql-postgresql-internals-practice/)

## DB 면접에서 특히 중요한 35개

신입·주니어라면 100개를 전부 같은 깊이로 외우기보다 다음 항목부터 준비하는 편이 효율적이다.

| 등급 | 영역          | 핵심 주제                     |
| --- | ----------- | ------------------------- |
| S  | SQL         | JOIN                      |
| S  | SQL         | WHERE vs HAVING           |
| S  | Index       | Index 기본 원리               |
| S  | Index       | B-Tree/B+Tree             |
| S  | Index       | Composite Index           |
| S  | Index       | Column 순서                 |
| S  | Index       | Leftmost Prefix           |
| S  | Index       | Covering Index            |
| S  | Index       | Index가 사용되지 않는 이유         |
| S  | 실행계획        | EXPLAIN                   |
| S  | 실행계획        | Seq Scan vs Index Scan    |
| S  | Transaction | ACID                      |
| S  | Transaction | Isolation Level           |
| S  | Transaction | Read Committed            |
| S  | Transaction | Repeatable Read           |
| S  | Transaction | Dirty Read                |
| S  | Transaction | Non-Repeatable Read       |
| S  | Transaction | Phantom Read              |
| S  | Lock        | Optimistic vs Pessimistic |
| S  | Lock        | SELECT FOR UPDATE         |
| S  | Lock        | Deadlock                  |
| S  | MVCC        | MVCC                      |
| S  | MVCC        | MySQL vs PostgreSQL MVCC  |
| S  | MySQL       | Clustered Index           |
| S  | MySQL       | Secondary Index           |
| S  | MySQL       | Undo / Redo               |
| S  | PostgreSQL  | Heap + Index              |
| S  | PostgreSQL  | VACUUM                    |
| S  | PostgreSQL  | Dead Tuple                |
| A  | Pagination  | Offset Pagination         |
| A  | Pagination  | Keyset Pagination         |
| A  | 운영          | Connection Pool           |
| S  | 정합성         | Unique Constraint         |
| S  | 동시성         | 중복 주문                     |
| A  | PostgreSQL  | Partial Unique Index      |

---

## Index 질문 연결 구조

면접관이 꼬리질문을 이어가기 쉬운 영역 중 하나가 Index다.

```text
Index가 무엇인가요?
        ↓
왜 B-Tree를 사용하나요?
        ↓
Composite Index란?
        ↓
(A, B)인데 B만 조회하면?
        ↓
Leftmost Prefix
        ↓
Range 조건 이후 Column
        ↓
Covering Index
        ↓
EXPLAIN
        ↓
Index가 있는데 Full Scan을 하는 이유
        ↓
Cardinality / Selectivity
        ↓
실제 Index 설계
```

예를 들어 다음 Query를 기준으로 살펴볼 수 있다.

```sql
SELECT id, status, created_at
FROM orders
WHERE user_id = ?
  AND status = 'PAID'
ORDER BY created_at DESC
LIMIT 20;
```

단순히

```sql
INDEX(user_id)
INDEX(status)
INDEX(created_at)
```

세 개를 따로 만드는 것보다 실제 조회 패턴을 보고

```sql
INDEX(user_id, status, created_at)
```

같은 Composite Index를 검토할 수 있다.

하지만 "`status`는 Cardinality가 낮으니 무조건 뒤"처럼 단순하게 외우면 안 된다. 실제 `WHERE`, 정렬, 데이터 분포, Query 빈도와 실행 계획을 함께 봐야 한다.

---

## Transaction 질문 연결 구조

```text
Transaction
    ↓
ACID
    ↓
Isolation
    ↓
Dirty Read
    ↓
Non-Repeatable Read
    ↓
Phantom Read
    ↓
MVCC
    ↓
Snapshot
    ↓
MySQL Repeatable Read
    ↓
PostgreSQL Read Committed
    ↓
Lock
    ↓
SELECT FOR UPDATE
    ↓
Deadlock
```

면접에서는 Isolation Level 네 개를 순서대로 말하는 것보다 **현재 사용하는 DB에서 실제로 어떻게 동작하는지**를 설명하는 편이 중요하다.

두 DB의 대표적인 구현 차이를 표로 묶으면 다음과 같다.

| 항목               | MySQL InnoDB          | PostgreSQL              |
| ---------------- | --------------------- | ----------------------- |
| 기본 Isolation     | Repeatable Read       | Read Committed          |
| Row 저장           | PK Clustered Index    | Heap                    |
| 일반 B-Tree Index  | Secondary Index → PK  | Index → Heap Tuple      |
| MVCC 이전 Version  | Undo 기반               | Tuple Version           |
| 정리               | Purge                 | VACUUM                  |
| Durability Log   | Redo Log              | WAL                     |
| 조건부 Unique Index | 직접적인 Partial Index 없음 | Partial Unique Index 지원 |

---

## 면접에서 피해야 할 답변

### 1. "Index를 걸면 무조건 빨라집니다."

조건과 비용을 생략한 접근이다.

조건에 해당하는 Row가 많으면 Full Scan이 더 빠를 수 있다.

---

### 2. "Cardinality가 높은 Column을 무조건 Index 앞에 둡니다."

Query 조건과 정렬을 무시한 답변이다.

```text
Equality 조건
Range 조건
JOIN
ORDER BY
데이터 분포
```

를 같이 봐야 한다.

---

### 3. "Repeatable Read에서는 Phantom Read가 발생합니다."

SQL 표준의 최소 보장만 외운 답변으로 보일 수 있다.

MySQL InnoDB와 PostgreSQL에서는 구현 방식에 따라 실제 동작이 표준의 단순한 표보다 강할 수 있다는 점까지 구분해야 한다.

---

### 4. "애플리케이션에서 exists()를 확인했기 때문에 중복 저장되지 않습니다."

조회와 저장 사이의 경쟁 조건을 놓친 답변이다.

```text
Request A → SELECT 없음
Request B → SELECT 없음

Request A → INSERT
Request B → INSERT
```

가 가능하기 때문에 최종 DB Constraint가 필요하다.

---

### 5. "SELECT FOR UPDATE를 쓰면 동시성 문제를 모두 해결할 수 있습니다."

Lock 자체가 새로운 비용을 만들 수 있다.

```text
Lock Wait
Deadlock
Throughput 저하
긴 Transaction
Connection 점유
```

까지 같이 고려해야 한다.

---

## Java → Spring → DB 연결 질문

실제 백엔드 면접에서는 세 영역을 분리하기보다 하나의 동시성 문제로 연결해서 묻는 경우가 많다.

예를 들어:

> "동일 상품 중복 주문이 발생했습니다. 어떻게 해결하시겠습니까?"

답변은 다음 흐름으로 구성할 수 있다.

```text
1. Race Condition 확인

Java
→ synchronized 고려
→ 단일 JVM만 보호

Spring
→ Singleton Bean이라고 해결되지 않음
→ 서버가 여러 대면 공유 Lock 아님

DB
→ Transaction
→ SELECT FOR UPDATE
→ Optimistic / Pessimistic Lock
→ Unique Constraint

분산 환경
→ Redis Lock 가능

최종
→ DB Constraint로 정합성 보장
```

또 하나는:

> "`@Transactional`을 사용했는데 중복 주문이 발생했습니다. 왜 그런가요?"

답변은 다음처럼 이어질 수 있다.

```text
Transaction
≠ 동시 실행 자동 직렬화

둘 다 동시에 SELECT
        ↓
둘 다 데이터 없음 확인
        ↓
둘 다 INSERT
        ↓
Race Condition

해결
→ Isolation / Lock
→ Unique Constraint
```

핵심은 Spring Transaction이 동시 실행을 자동으로 직렬화하지 않는다는 점이다. 마지막 정합성은 데이터 모델과 DB Constraint까지 연결해서 설명해야 한다.

## 참고 자료

- [MySQL 8.4 Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [MySQL 8.4 — Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)
- [MySQL 8.4 — Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)
- [MySQL 8.4 — EXPLAIN Statement](https://dev.mysql.com/doc/refman/8.4/en/explain.html)
- [PostgreSQL 18 Documentation](https://www.postgresql.org/docs/18/)
- [PostgreSQL 18 — Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html)
- [PostgreSQL 18 — Using EXPLAIN](https://www.postgresql.org/docs/18/using-explain.html)
- [PostgreSQL 18 — Index-Only Scans and Covering Indexes](https://www.postgresql.org/docs/18/indexes-index-only-scans.html)
- [PostgreSQL 18 — Routine Vacuuming](https://www.postgresql.org/docs/18/routine-vacuuming.html)
- [PostgreSQL 18 — Explicit Locking](https://www.postgresql.org/docs/18/explicit-locking.html)
