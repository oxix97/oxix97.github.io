import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

type FrontmatterValue =
  | boolean
  | number
  | string
  | string[]
  | Record<string, boolean | number | string | string[]>;

type ImageContract = {
  directory?: string;
  file: string;
};

type ArticleContract = {
  file: string;
  slug?: string;
  title: string;
  order: number;
  publishedAt: string;
  tags: string[];
  units: { title: string; unitId: number }[];
  sections: string[];
  images?: ImageContract[];
};

const studyRoot = new URL('../src/content/docs/study/', import.meta.url);
const publicRoot = new URL('../public/', import.meta.url);
const readPublicFile = (path: string) =>
  readFile(new URL(path, publicRoot), 'utf8');
const inflearnCoursePrefix =
  'https://www.inflearn.com/courses/lecture?courseId=328823&unitId=';
const courseUrl = (unitId: number) => `${inflearnCoursePrefix}${unitId}`;

const articles: ArticleContract[] = [
  {
    file: 'network-performance-metrics.md',
    title: '대역폭이 넓어도 느릴 수 있는 이유: 트래픽·처리량·RTT의 차이',
    order: 1,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Performance', 'RTT', 'Backend'],
    units: [
      {
        title:
          '네트워크의 기초 #1. 네트워크, 처리량, 트래픽, 대역폭, RTT ★★★',
        unitId: 121330,
      },
    ],
    sections: [
      '핵심 요약',
      '트래픽과 처리량의 차이',
      '대역폭과 실제 처리량이 다른 이유',
      'RTT가 API 응답 시간에 미치는 영향',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'topology-and-bottlenecks.md',
    title: '연결 구조가 장애 범위를 결정한다: 네트워크 토폴로지와 병목 분석',
    order: 2,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Topology', 'Bottleneck', 'Backend'],
    units: [
      {
        title: '네트워크의 기초 #2. 네트워크 토폴로지 : 버스, 스타, 트리 ★★★',
        unitId: 121331,
      },
      {
        title: '네트워크의 기초 #3. 네트워크 토폴로지 : 링, 메시 ★★★',
        unitId: 121332,
      },
      {
        title: '네트워크의 기초 #4.  병목현상과 네트워크 토폴로지의 필요성 ★★★',
        unitId: 130662,
      },
    ],
    sections: [
      '핵심 요약',
      '버스형·스타형·트리형 토폴로지',
      '링형·메시형 토폴로지',
      '연결 구조에서 병목이 발생하는 지점',
      '백엔드 시스템에서 병목을 찾는 순서',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'network-classification.md',
    title: '유니캐스트부터 WAN까지: 네트워크를 구분하는 두 가지 기준',
    order: 3,
    publishedAt: '2026-08-10',
    tags: ['Network', 'Unicast', 'LAN', 'Backend'],
    units: [
      {
        title: '네트워크의 기초 #5. 유니캐스트, 멀티캐스트, 브로드캐스트 ★★★',
        unitId: 164725,
      },
      { title: '네트워크의 분류 : LAN, MAN, WAN ★☆☆', unitId: 130855 },
    ],
    sections: [
      '핵심 요약',
      '전달 대상에 따른 분류',
      '유니캐스트·멀티캐스트·브로드캐스트 비교',
      '통신 범위에 따른 분류',
      'LAN·MAN·WAN 비교',
      '백엔드 통신은 어떤 방식에 해당하는가',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'tcp-ip-layers-and-encapsulation.md',
    title: 'TCP/IP 4계층은 데이터를 어떻게 전달하는가',
    order: 4,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCPIP', 'Encapsulation', 'Backend'],
    units: [
      {
        title: 'TCP/IP 4계층 #1. 개념, 캡슐화, 비캡슐화, PDU, OSI 7계층 ★★★',
        unitId: 116066,
      },
      {
        title: 'TCP/IP 4계층 #3. 애플리케이션 계층(application) ★★★',
        unitId: 116067,
      },
      {
        title: 'TCP/IP 4계층 #5. 인터넷 계층(network) ★★★',
        unitId: 132275,
      },
    ],
    sections: [
      '핵심 요약',
      'TCP/IP 4계층의 책임',
      '계층별 PDU와 대표 프로토콜',
      '캡슐화와 역캡슐화',
      'OSI 7계층과 어떻게 대응하는가',
      'HTTP 요청이 네트워크를 통과하는 과정',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'tcp-ip-layer-stack.svg',
      },
      {
        file: 'tcp-encapsulation-flow.svg',
      },
    ],
  },
  {
    file: 'tcp-udp-mtu-mss-pmtud.md',
    slug: 'tcp-udp-checksums-crc',
    title: 'TCP와 UDP는 오류를 어떻게 다루는가: 신뢰성·체크섬·CRC',
    order: 5,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCP', 'UDP', 'Checksum'],
    units: [
      {
        title: 'TCP/IP 4계층 #4. 전송 계층(transport) ★★★',
        unitId: 132274,
      },
    ],
    sections: [
      '핵심 요약',
      'TCP와 UDP는 서로 다른 전달 서비스를 제공한다',
      '체크섬과 CRC는 손상을 검출한다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
    ],
  },
  {
    file: 'mtu-mss-pmtud-nagle.md',
    title: 'MTU·MSS·PMTUD와 네이글 알고리즘',
    order: 6,
    publishedAt: '2026-09-29',
    tags: ['Network', 'MTU', 'MSS', 'PMTUD'],
    units: [
      { title: 'TCP/IP 4계층 #2. MTU와 MSS와 PMTUD ★★★', unitId: 116686 },
      { title: 'Q. 네이글 알고리즘이란 무엇인가요? ★☆☆', unitId: 210101 },
    ],
    sections: [
      '핵심 요약',
      'MTU와 MSS는 서로 다른 범위를 센다',
      'PMTUD는 경로에서 보낼 크기를 찾는다',
      '작은 TCP 쓰기를 모으는 네이글 알고리즘',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'mtu-mss-packet.svg',
      },
      {
        file: 'pmtud-path.svg',
      },
    ],
  },
  {
    file: 'tcp-connection-lifecycle.md',
    title: 'TCP 연결의 생명주기: 3-way에서 TIME_WAIT까지',
    order: 7,
    publishedAt: '2026-08-11',
    tags: ['Network', 'TCP', 'Handshake', 'TIME_WAIT'],
    units: [
      {
        title: 'TCP의 연결성립 : 3-웨이 핸드셰이크 ★★★',
        unitId: 116078,
      },
      {
        title: 'TCP의 연결해제 : 4-웨이 핸드셰이크와TIME_WAIT ★★★',
        unitId: 130876,
      },
    ],
    sections: [
      '핵심 요약',
      '3-way handshake가 확인하는 것',
      'ISN과 Sequence·Acknowledgement Number',
      '4-way handshake에서 FIN과 ACK가 분리되는 이유',
      'TIME_WAIT이 필요한 이유',
      'CLOSE_WAIT과 TIME_WAIT을 운영에서 해석하는 방법',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        file: 'tcp-three-way-handshake.svg',
      },
      {
        file: 'tcp-four-way-handshake-time-wait.svg',
      },
    ],
  },
  {
    file: 'routing-and-routing-table.md',
    title: '라우터는 다음 경로를 어떻게 고르는가: 라우팅과 라우팅 테이블',
    order: 8,
    publishedAt: '2026-08-13',
    tags: ['Network', 'Routing', 'Router', 'Backend'],
    units: [
      {
        title: '라우팅 #1. 개념과 라우터 ★★★',
        unitId: 116653,
      },
      {
        title: '라우팅 #2. 라우팅테이블 ★★★',
        unitId: 131314,
      },
    ],
    sections: [
      '핵심 요약',
      '라우팅·라우터·라우팅 테이블의 관계',
      '라우팅 테이블에서 읽어야 할 정보',
      '가장 긴 프리픽스가 먼저 선택되는 이유',
      '`ip route` 출력 읽기',
      '라우팅 테이블을 운영에서 확인하는 순서',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'ip-mac-arp-rarp.md',
    title: 'IP 주소를 알면 MAC 주소는 어떻게 찾는가: ARP와 RARP',
    order: 9,
    publishedAt: '2026-08-13',
    tags: ['Network', 'IP', 'MAC', 'ARP'],
    units: [
      {
        title: 'IP주소, MAC주소, ARP, RARP ★★★',
        unitId: 116068,
      },
    ],
    sections: [
      '핵심 요약',
      'IP 주소와 MAC 주소가 모두 필요한 이유',
      'ARP가 같은 링크의 MAC 주소를 찾는 과정',
      '원격 서버로 보낼 때 ARP가 찾는 주소',
      'RARP는 ARP의 일반적인 역함수가 아니다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'ipv4-ipv6-addressing.md',
    title: 'IPv4와 IPv6 주소는 어떻게 읽는가: 이진수와 주소 표현',
    order: 12,
    publishedAt: '2026-08-13',
    tags: ['Network', 'IPv4', 'IPv6', 'Addressing'],
    units: [
      {
        title: 'IP주소체계 #1: 이진수 이해하기 ★★★',
        unitId: 121628,
      },
      {
        title: 'IP주소체계 #2: IPv4와 IPv6 ★★★',
        unitId: 131650,
      },
    ],
    sections: [
      '핵심 요약',
      '이진수의 자릿값으로 IP 주소 읽기',
      'IPv4는 32비트를 네 옥텟으로 나눈다',
      'IPv6는 128비트를 16진수로 표현한다',
      'IPv4와 IPv6의 프로토콜 차이',
      'IPv6와 IPsec을 구분해야 하는 이유',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'classful-cidr-subnetting-nat.md',
    title: '클래스풀에서 CIDR과 NAT까지: IPv4 주소 부족을 다루는 방법',
    order: 13,
    publishedAt: '2026-08-13',
    tags: ['Network', 'CIDR', 'Subnetting', 'NAT'],
    units: [
      {
        title: 'IP주소체계 #3. 클래스풀(Classful IP Addressing) ★★★',
        unitId: 131651,
      },
      {
        title: 'IP주소체계 #4. 클래스리스와 서브넷마스크, 서브네팅 ★★★',
        unitId: 131652,
      },
      {
        title: 'IP주소체계 #5. 공인IP(public IP)와 사설IP(private IP)와 NAT ★★★',
        unitId: 131653,
      },
    ],
    sections: [
      '핵심 요약',
      '클래스풀 주소 체계가 주소를 낭비한 이유',
      'CIDR과 서브네팅은 같은 말이 아니다',
      '`192.168.1.130/26` 계산하기',
      '사설 주소는 여러 네트워크에서 재사용한다',
      'Basic NAT와 NAPT의 차이',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'http-headers-and-versions.md',
    slug: 'http-messages-and-http-1',
    title: 'HTTP 메시지와 HTTP/1.x: 헤더·연결 재사용·HOL',
    order: 14,
    publishedAt: '2026-08-14',
    tags: ['Network', 'HTTP', 'HTTP1'],
    units: [
      { title: 'HTTP 헤더(header) ★★★', unitId: 141046 },
      {
        title:
          'DEEP DIVE : HTTP/1.0과 HTTP/1.1의 차이와 keep-alive, HOL까지 ★★★',
        unitId: 116070,
      },
    ],
    sections: [
      '핵심 요약',
      'HTTP/1.1 메시지는 어떻게 생겼는가',
      'HTTP/1.0과 HTTP/1.1은 연결을 다르게 사용한다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'http-2-and-http-3.md',
    title: 'HTTP/2와 HTTP/3: 멀티플렉싱과 HOL의 변화',
    order: 15,
    publishedAt: '2026-09-29',
    tags: ['Network', 'HTTP2', 'HTTP3', 'QUIC'],
    units: [{ title: 'DEEP DIVE : HTTP/2와 HTTP/3의 차이 ★★★', unitId: 121644 }],
    sections: [
      '핵심 요약',
      'HTTP/2는 스트림을 프레임으로 나눈다',
      'HTTP/3는 QUIC 위에서 스트림을 전달한다',
      '버전 선택은 환경과 구현을 함께 본다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [{ directory: 'http', file: 'http-version-streams.svg' }],
  },
  {
    file: 'https-tls-1-3-handshake.md',
    title: 'TLS 1.3 핸드셰이크는 연결 키를 어떻게 만드는가',
    order: 17,
    publishedAt: '2026-08-14',
    tags: ['Network', 'HTTPS', 'TLS', 'Handshake'],
    units: [
      {
        title: 'DEEP DIVE : HTTPS와 TLS #2. TLS 핸드셰이크 ★★☆',
        unitId: 129789,
      },
    ],
    sections: [
      '핵심 요약',
      '핸드셰이크는 협상·인증·키 설정을 이어 간다',
      '인증서 검증과 트래픽 키 파생',
      '0-RTT는 지연과 replay 위험을 함께 가진다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        directory: 'http',
        file: 'tls-1-3-handshake.svg',
      },
    ],
  },
  {
    file: 'https-cryptography-and-certificates.md',
    title: 'HTTPS 암호화와 인증서: 기밀성·키 합의·서버 인증',
    order: 16,
    publishedAt: '2026-09-29',
    tags: ['Network', 'HTTPS', 'TLS', 'Certificate'],
    units: [{ title: 'DEEP DIVE : HTTPS와 TLS #1. 암호화  ★★☆', unitId: 116071 }],
    sections: [
      '핵심 요약',
      '대칭키는 실제 데이터 보호를 맡는다',
      '공개키와 전자서명은 키 합의와 신원 검증을 돕는다',
      '인증서는 공개키를 서버 이름에 연결한다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'browser-storage-and-cookies.md',
    title:
      '브라우저 저장소는 무엇이 다른가: 로컬스토리지·세션스토리지·쿠키 비교',
    order: 18,
    publishedAt: '2026-08-25',
    tags: ['Network', 'WebStorage', 'Cookie', 'Browser'],
    units: [
      {
        title: '웹브라우저의 캐시 #1. 로컬스토리지의 개념과 실습 ★★★',
        unitId: 120258,
      },
      {
        title: '웹브라우저의 캐시 #2. 로컬스토리지와 오리진(origin) ★★★',
        unitId: 140056,
      },
      {
        title: '웹브라우저의 캐시 #3. 로컬스토리지의 활용사례 : 캐싱 ★★★',
        unitId: 120257,
      },
      {
        title: '웹브라우저의 캐시 #4. 세션스토리지 ★★★',
        unitId: 116075,
      },
      {
        title: '웹브라우저의 캐시 #5. 쿠키(Cookie) ★★★',
        unitId: 140423,
      },
      {
        title:
          '웹브라우저의 캐시 #6. 로컬스토리지, 세션스토리지, 쿠키의 공통점과 차이점 ★★★',
        unitId: 140839,
      },
    ],
    sections: [
      '핵심 요약',
      '브라우저에 저장된다고 모두 HTTP 캐시는 아니다',
      '로컬스토리지는 오리진별로 오래 남는 문자열 저장소다',
      '세션스토리지는 탭의 작업 흐름을 분리한다',
      '쿠키는 요청에 실려 서버로 돌아가는 상태다',
      '세 저장소의 선택 기준',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'session-vs-token-authentication.md',
    title: '로그인 상태는 어디에 저장되는가: 세션 인증과 토큰 인증 비교',
    order: 19,
    publishedAt: '2026-08-25',
    tags: ['Network', 'Authentication', 'Session', 'JWT'],
    units: [
      {
        title: '로그인 #1. 세션기반인증방식 : 개념 ★★★',
        unitId: 116072,
      },
      {
        title: '로그인 #2. 세션기반인증방식 : 실습 ★★★',
        unitId: 116076,
      },
      {
        title: '로그인 #3. 토큰기반인증방식(access토큰, refresh토큰) 개념 ★★★',
        unitId: 141252,
      },
      {
        title: '로그인 #4. 토큰기반인증방식(access토큰, refresh토큰) 실습 ★★★',
        unitId: 141253,
      },
    ],
    sections: [
      '핵심 요약',
      'HTTP가 요청 사이의 로그인 상태를 기억하지 않는 이유',
      '세션 기반 인증은 서버가 상태를 보관한다',
      'JWT 기반 Access Token은 클라이언트가 증표를 보낸다',
      'Access Token과 Refresh Token을 나누는 이유',
      '세션과 토큰의 인증 흐름 비교',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
    images: [
      {
        directory: 'http',
        file: 'session-token-auth-flow.svg',
      },
    ],
  },
  {
    file: 'http-methods-status-and-idempotency.md',
    title: 'HTTP 요청은 무엇을 뜻하는가: 메서드·상태 코드·멱등성',
    order: 20,
    publishedAt: '2026-09-29',
    tags: ['Network', 'HTTP', 'REST', 'Idempotency'],
    units: [
      { title: 'HTTP 상태코드 ★★★', unitId: 141380 },
      { title: 'HTTP 메서드: GET과 POST ★★★', unitId: 141381 },
      { title: 'HTTP 메서드: PUT과 PATCH ★★★', unitId: 141382 },
      { title: 'HTTP의 멱등성이 무엇인가요? ★★★', unitId: 222647 },
      { title: 'HTTP 멱등성과 API 실습 ★★★', unitId: 222648 },
    ],
    sections: ['핵심 요약', '메서드와 상태 코드는 서로 다른 질문에 답한다', 'GET·POST·PUT·PATCH의 선택 기준', '주문 요청을 재시도해야 한다면', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'rest-api.md',
    title: 'REST API는 리소스를 어떻게 표현하고 연결하는가',
    order: 21,
    publishedAt: '2026-09-29',
    tags: ['Network', 'HTTP', 'REST', 'API'],
    units: [{ title: 'REST API ★★★', unitId: 116077 }],
    sections: [
      '핵심 요약',
      'REST는 리소스와 표현을 구분한다',
      '균일한 인터페이스가 API 연결을 단순하게 한다',
      '다른 제약은 서버와 클라이언트의 책임을 나눈다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
  {
    file: 'network-devices-and-ethernet.md',
    title: '네트워크 장치와 이더넷: 패킷은 어느 장치를 거치는가',
    order: 10,
    publishedAt: '2026-09-29',
    tags: ['Network', 'Ethernet', 'Switch', 'Router'],
    units: [
      { title: '네트워크를 이루는 장치의 이해 ★☆☆', unitId: 121640 },
      { title: '네트워크를 이루는 장치 #1 애플리케이션 계층 ★★★', unitId: 121641 },
      { title: '네트워크를 이루는 장치 #2 전송 계층 ★☆☆', unitId: 121642 },
      { title: '네트워크를 이루는 장치 #3 인터넷 계층 ★★★', unitId: 121643 },
      { title: '네트워크를 이루는 장치 #4 데이터링크계층 ★★★', unitId: 121645 },
      { title: '네트워크를 이루는 장치 #5 물리계층 ★☆☆', unitId: 121647 },
      { title: '이더넷 프레임 구조 ★☆☆', unitId: 121646 },
    ],
    sections: ['핵심 요약', '같은 LAN과 외부 네트워크의 다음 홉', '이더넷 프레임에서 확인할 부분', '장치 이름을 계층과 연결하기', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'wired-lan-and-wifi.md',
    title: '유선 LAN과 Wi-Fi는 전송 매체를 어떻게 공유하는가',
    order: 11,
    publishedAt: '2026-09-29',
    tags: ['Network', 'Ethernet', 'WiFi', 'LAN'],
    units: [
      { title: '유선 LAN #1 전이중화 통신과 CSMA/CD ★★☆', unitId: 121648 },
      { title: '유선 LAN #2 케이블 ★☆☆', unitId: 121649 },
      { title: '무선 LAN #1 CSMA/CA와 Wi-Fi ★★☆', unitId: 121650 },
      { title: '무선 LAN #2 주파수 ★☆☆', unitId: 121651 },
    ],
    sections: ['핵심 요약', '유선 링크에서 전이중과 충돌을 구분하기', 'Wi-Fi에서 충돌을 피하려는 순서', '2.4GHz와 5GHz를 고르는 기준', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'traffic-overload-and-bottlenecks.md',
    title: '트래픽이 늘어 응답이 느려질 때 무엇부터 확인하는가',
    order: 22,
    publishedAt: '2026-09-29',
    tags: ['Network', 'Performance', 'LoadBalancing', 'Reliability'],
    units: [
      { title: '대규모 트래픽으로 인한 서버 과부화 해결방법 #1 ★★★', unitId: 129505 },
      { title: '대규모 트래픽으로 인한 서버 과부화 해결방법 #2 ★★★', unitId: 129506 },
      { title: '대규모 트래픽으로 인한 서버 과부화 해결방법 #3 ★★★', unitId: 141066 },
    ],
    sections: ['핵심 요약', '느리다는 증상을 구간으로 나누기', '측정 결과에 맞춰 대응하기', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'browser-security-boundaries.md',
    title: '브라우저 보안 경계: CORS·XSS·CSRF는 무엇이 다른가',
    order: 23,
    publishedAt: '2026-09-29',
    tags: ['Network', 'Browser', 'CORS', 'XSS', 'CSRF'],
    units: [
      { title: 'CORS란 무엇인가요? ★★★', unitId: 197977 },
      { title: 'XSS가 무엇인가요? ★★★', unitId: 291041 },
      { title: 'CSRF가 무엇인가요? ★★★', unitId: 291042 },
    ],
    sections: ['핵심 요약', '출처와 사이트를 먼저 구분한다', 'CORS는 응답 접근 권한을 조정한다', 'XSS는 데이터가 코드가 되는 경계다', 'CSRF는 자동 전송되는 인증 정보를 악용한다', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'url-to-screen.md',
    title: '주소 입력부터 화면까지: DNS·연결·요청·렌더링 이어 보기',
    order: 25,
    publishedAt: '2026-09-29',
    tags: ['Network', 'DNS', 'HTTP', 'Browser'],
    units: [
      { title: '주소 입력 뒤 과정과 DNS ★★★', unitId: 116069 },
    ],
    sections: ['핵심 요약', '한 번의 새 방문을 기준으로 따라가기', '응답 뒤 브라우저가 화면을 표시한다', '생략되거나 달라지는 단계', '장점과 한계', '기술면접 질문', '복습 체크리스트', '참고 자료'],
  },
  {
    file: 'browser-rendering.md',
    title: '브라우저 렌더링: HTML에서 화면까지',
    order: 24,
    publishedAt: '2026-09-29',
    tags: ['Browser', 'Rendering', 'DOM', 'CSS'],
    units: [{ title: '브라우저 렌더링 과정 ★★☆', unitId: 116074 }],
    sections: [
      '핵심 요약',
      'HTML과 CSS에서 DOM·CSSOM을 만든다',
      '렌더 트리와 레이아웃을 계산한다',
      '그리기와 합성으로 화면을 표시한다',
      '장점과 한계',
      '기술면접 질문',
      '복습 체크리스트',
      '참고 자료',
    ],
  },
].sort((a, b) => a.order - b.order);

const articleRoute = (article: ArticleContract) =>
  `/study/network/${article.slug ?? article.file.replace(/\.md$/, '')}/`;
const readStudyFile = (path: string) => readFile(new URL(path, studyRoot), 'utf8');

function parseScalar(value: string): boolean | number | string | string[] {
  const isQuoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  if (isQuoted) return value.slice(1, -1);
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim());
  }
  return value;
}

function parseFrontmatter(markdown: string): Record<string, FrontmatterValue> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error('frontmatter block is missing');

  const parsed: Record<string, FrontmatterValue> = {};
  let parentKey: string | undefined;

  for (const line of match[1].split('\n')) {
    const field = line.match(/^(\s*)([A-Za-z][\w]*):(?:\s*(.*))?$/);
    if (!field) throw new Error(`unsupported frontmatter line: ${line}`);

    const [, indentation, key, rawValue = ''] = field;
    if (indentation.length === 0) {
      if (rawValue === '') {
        parsed[key] = {};
        parentKey = key;
      } else {
        parsed[key] = parseScalar(rawValue);
        parentKey = undefined;
      }
      continue;
    }

    const parent = parentKey ? parsed[parentKey] : undefined;
    if (!parentKey || typeof parent !== 'object' || Array.isArray(parent)) {
      throw new Error(`frontmatter nesting is invalid: ${line}`);
    }
    parent[key] = parseScalar(rawValue);
  }

  return parsed;
}

function extractSection(markdown: string, heading: string): string {
  const marker = `## ${heading}\n`;
  const start = markdown.indexOf(marker);
  if (start === -1) throw new Error(`section is missing: ${heading}`);
  const contentStart = start + marker.length;
  const nextHeading = markdown.indexOf('\n## ', contentStart);
  return markdown.slice(
    contentStart,
    nextHeading === -1 ? markdown.length : nextHeading,
  );
}

function extractMarkdownLinks(markdown: string) {
  return [...markdown.matchAll(/\[([^\]]+)]\(([^)]+)\)/g)].map(
    ([, title, href]) => ({ title, href }),
  );
}

function extractInterviewAnswers(markdown: string) {
  const section = extractSection(markdown, '기술면접 질문');
  const headings = [...section.matchAll(/^### (.+)$/gm)];
  return headings.map((heading, index) => {
    const bodyStart = (heading.index ?? 0) + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? section.length;
    return {
      question: heading[1],
      answer: section.slice(bodyStart, bodyEnd).trim(),
    };
  });
}

function splitSentences(answer: string) {
  return answer
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function expectedNavigation(index: number) {
  const parts: string[] = [];
  if (index > 0) {
    const previous = articles[index - 1];
    parts.push(`이전: [${previous.title}](${articleRoute(previous)})`);
  }
  parts.push('[연재 목록](/study/network/)');
  if (index < articles.length - 1) {
    const next = articles[index + 1];
    parts.push(`다음: [${next.title}](${articleRoute(next)})`);
  }
  return parts.join(' · ');
}

describe('network Study series', () => {
  it('links the series from the Study index', async () => {
    const studyIndex = await readStudyFile('index.md');
    expect(studyIndex).toContain('[CS 지식의 정석 - 네트워크](/study/network/)');
  });

  it('defines all twenty-five articles as exact links in reading order', async () => {
    const hub = await readStudyFile('cs/network/index.md');
    const frontmatter = parseFrontmatter(hub);
    const readingOrder = extractSection(hub, '읽는 순서');
    const links = [
      ...readingOrder.matchAll(/^\d+\.\s+\[([^\]]+)]\(([^)]+)\)$/gm),
    ].map(([, title, href]) => ({ title, href }));

    expect(frontmatter.title).toBe('CS 지식의 정석 - 네트워크');
    expect(links).toEqual(
      articles.map(({ file, slug, title }) => ({
        title,
        href: `./${slug ?? file.replace(/\.md$/, '')}/`,
      })),
    );
  });

  it('keeps the exact previous, list, and next navigation chain', async () => {
    for (const [index, article] of articles.entries()) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      expect(markdown.trimEnd().split('\n').at(-1)).toBe(
        expectedNavigation(index),
      );
    }
  });

  it('keeps exactly three interview answers with exactly three sentences', async () => {
    let answerCount = 0;

    for (const article of articles) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      const answers = extractInterviewAnswers(markdown);

      expect(answers, article.file).toHaveLength(3);
      for (const { question, answer } of answers) {
        expect(question, article.file).not.toBe('');
        expect(answer, `${article.file}: ${question}`).not.toContain('\n\n');
        expect(
          splitSentences(answer),
          `${article.file}: ${question}`,
        ).toHaveLength(3);
      }
      answerCount += answers.length;
    }

    expect(answerCount).toBe(articles.length * 3);
  });

  it('keeps accessible static SVG diagrams for each illustrated article', async () => {
    for (const article of articles) {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      for (const diagram of article.images ?? []) {
        const assetPath = `images/study/network/${diagram.directory ?? 'tcp'}/${diagram.file}`;
        const svg = await readPublicFile(assetPath);
        expect(svg, diagram.file).toMatch(/^<svg[\s>]/);
        expect(svg, diagram.file).toContain('<title');
        expect(svg, diagram.file).toContain('<desc');
        const figure = markdown.match(
          new RegExp(
            `<figure class="study-diagram">[\\s\\S]*?src="/${assetPath}"[\\s\\S]*?</figure>`,
          ),
        )?.[0];
        expect(figure, diagram.file).toBeDefined();
        expect(figure, diagram.file).toMatch(/alt="[^"]+"/);
        expect(figure, diagram.file).toContain('loading="lazy"');
        expect(figure, diagram.file).toMatch(
          /<figcaption>\s*\S[\s\S]*?<\/figcaption>/,
        );
      }
    }
  });

  it('distinguishes Kafka consumer distribution from IP multicast', async () => {
    const markdown = await readStudyFile('cs/network/network-classification.md');
    const section = extractSection(
      markdown,
      '백엔드 통신은 어떤 방식에 해당하는가',
    );

    expect(section).toMatch(
      /Kafka 소비자 그룹의 (?:메시지 )?분배는 네트워크 계층의 IP 멀티캐스트와 (?:같지 않|다르)/,
    );
  });

  it('keeps the HTTP HOL boundary aligned with each transport', async () => {
    const markdown = await readStudyFile(
      'cs/network/http-2-and-http-3.md',
    );

    expect(markdown).toMatch(
      /HTTP\/2가 줄인 것은 HTTP 요청·응답 사이의 애플리케이션 계층 HOL이며, TCP 바이트 스트림의 HOL은 남는다/,
    );
    expect(markdown).toMatch(
      /같은 QUIC 스트림 안의 순서 대기도 사라지지 않는다/,
    );
  });

  it('keeps TLS key agreement, authentication, and 0-RTT risks separate', async () => {
    const markdown = await readStudyFile(
      'cs/network/https-tls-1-3-handshake.md',
    );

    expect(markdown).toMatch(/ECDHE 공유 비밀/);
    expect(markdown).toMatch(/CertificateVerify/);
    expect(markdown).toMatch(/HKDF로 여러 트래픽 키를 파생/);
    expect(markdown).toMatch(/0-RTT[\s\S]*replay/);
  });

  it('keeps session state, JWT visibility, and refresh token state separate', async () => {
    const markdown = await readStudyFile(
      'cs/network/session-vs-token-authentication.md',
    );

    expect(markdown).toMatch(/서버가 로그인 상태를 저장하고 세션 ID로 찾는다/);
    expect(markdown).toMatch(/Base64url 인코딩은 암호화가 아니다/);
    expect(markdown).toMatch(/Access Token이 항상 JWT인 것은 아니다/);
    expect(markdown).toMatch(/회전 관계와 폐기 상태[\s\S]*정보를 보관/);
  });

  for (const article of articles) {
    it(`keeps the parsed content contract for ${article.file}`, async () => {
      const markdown = await readStudyFile(`cs/network/${article.file}`);
      const frontmatter = parseFrontmatter(markdown);

      expect(frontmatter.title).toBe(`${String(article.order).padStart(2, '0')}. ${article.title}`);
      if (article.slug) {
        expect(frontmatter.slug).toBe(`study/network/${article.slug}`);
      }
      expect(frontmatter.contentType).toBe('study');
      expect(frontmatter.publishedAt).toBe(article.publishedAt);
      expect(frontmatter.tags).toEqual(article.tags);
      expect(frontmatter.series).toBe('CS 지식의 정석 - 네트워크');
      expect(frontmatter.topic).toBe('Network');
      expect(frontmatter.difficulty).toBe('intermediate');
      expect(frontmatter.draft ?? false).toBe(false);
      expect(frontmatter.sidebar).toEqual({ order: article.order });

      for (const heading of article.sections) {
        expect(() => extractSection(markdown, heading)).not.toThrow();
      }

      if (article.file === 'network-performance-metrics.md') {
        const rttSection = extractSection(
          markdown,
          'RTT가 API 응답 시간에 미치는 영향',
        );
        expect(rttSection).toMatch(
          /애플리케이션 처리 시간과 네트워크 왕복 시간을 분리/,
        );
      }

      const officialLinks = extractMarkdownLinks(
        extractSection(markdown, '참고 자료'),
      ).filter(({ href }) => href.startsWith(inflearnCoursePrefix));
      expect(officialLinks).toEqual(
        article.units.map(({ title, unitId }) => ({
          title,
          href: courseUrl(unitId),
        })),
      );
    });
  }
});
