'use strict';
/* Public editorial data, not a record of customer testimonials.
 * Persona names identify educational scenarios. Only the first five persona
 * ages have a production-source reference; all unknown ages/cities stay null.
 * Text summaries are not transcripts of the associated role-avatar videos.
 * Relative media URLs are project-root-relative, not script-relative.
 */
(() => {
  const roleLabels = Object.freeze({
    'a-prepod': "가정교사와 교사",
    'a-psiholog': "심리학자와 코치",
    'a-novichok': "전문가 및 초보자",
    'a-marketolog': "마케팅 담당자 및 생산자",
    'a-magazin': "상점과 서비스"
  });

  const cases = [
    {
      id: 'student_01', roleId: 'a-prepod', name: "엘레나", age: 34, city: null,
      specialty: "영어 교사",
      headline: "교육적 검토 · 반복적인 설명 대신 알림",
      quote: "교육용 예시는 영어로 된 짧은 소개를 상기시켜줍니다. 여기에서는 성공 사례 대신 샘플 답변, 학생을 위한 과제, 교사의 시험에 대해 논의합니다.",
      taskBuiltIn3Evenings: "$19를 위한 3일 저녁 학습 과제: 샘플이 포함된 메모 준비, 연습 및 자가 테스트. 마지막 단계에서 교사는 어휘를 확인하고 승인된 버전을 저장합니다.",
      routineBefore: "원래 시나리오에서는 교사가 짧은 소개의 구조를 매번 새롭게 설명합니다. 샘플 답변은 다른 노트에 남아 있으므로 적절한 예를 수동으로 검색해야 합니다.",
      resultAfter: "타겟 빌드 아티팩트: 연습 및 샘플이 포함된 테스트된 치트 시트 1개. 테스트 요청 시 원하는 버전의 출력을 확인해야 하며 등급 증가를 약속해서는 안 됩니다.",
      videoSrc: 'assets/videos/student_01_a-prepod.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "레슨",
      nextStep: "훈련 경로에서 LESSON이라는 단어를 보내고 테스트 요청에 대한 알림 발행을 확인하십시오."
    },
    {
      id: 'student_02', roleId: 'a-psiholog', name: "마리나", age: 41, city: null,
      specialty: "심리학자",
      headline: "교육 세션 · 첫 회의 규칙",
      quote: "사례 연구는 첫 번째 회의 전 조직 메모에 관한 것입니다. 형식, 시간대, 이체순서를 확인하며, 개인 고객사례는 활용하지 않습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 승인된 녹음 규칙에서 메모를 수집합니다. 전문가는 텍스트 발행을 허용하기 전에 알 수 없는 조건을 독립적으로 설명합니다.",
      routineBefore: "원래 시나리오에서는 동일한 조직적 질문이 서로 다른 방식으로 나타납니다. 전문가는 약속 시간을 수동으로 확인하고 일정 조정 및 일정 변경에 대해 합의된 규칙을 반복합니다.",
      resultAfter: "대상 빌드 아티팩트: 조직의 질문에 대한 답변이 포함된 합의된 텍스트입니다. 검토는 진단이나 치료 결과가 아닌 규칙 및 개인 정보 보호의 정확성에 관한 것입니다.",
      videoSrc: 'assets/videos/student_02_a-psiholog.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "회의",
      nextStep: "훈련 경로에서 MEETING이라는 단어를 요청하고 전문가가 승인한 규칙이 포함된 메모를 확인합니다."
    },
    {
      id: 'student_03', roleId: 'a-novichok', name: "이고르", age: 44, city: null,
      specialty: "전문가, 첫 번째 콘텐츠 프로젝트",
      headline: "교육 분석 · 음성 메모에서 게시",
      quote: "사례 연구는 전문가가 직접 작성한 설명으로 시작됩니다. 메모를 통해 하나의 게시물 초안이 작성되며 사실과 문구는 작성자가 확인할 사항으로 남아 있습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 자신의 메모를 복사하고 게시물을 준비하세요. 그런 다음 작성자는 출처와 비교하여 진술을 확인하고 승인된 텍스트만 저장합니다.",
      routineBefore: "원래 시나리오에서는 전화기의 음성 메모에 유용한 설명이 남아 있습니다. 출판 전에 전문가는 텍스트를 다시 입력하고 초안에서 반복되는 생각을 수동으로 제거합니다.",
      resultAfter: "대상 빌드 아티팩트: 동일한 주제의 원본 메모 및 검토된 게시물입니다. 출판은 저자의 개별 결정이며, 여기에서는 수입과 도달 범위가 측정되지 않았습니다.",
      videoSrc: 'assets/videos/student_03_a-novichok.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "참고",
      nextStep: "학습 경로에서 NOTE라는 단어를 요청하고 각 게시물 설명을 원래 게시물과 비교하세요."
    },
    {
      id: 'student_04', roleId: 'a-marketolog', name: "알리나", age: 25, city: null,
      specialty: "마케터",
      headline: "훈련 분석 · 합의된 개요의 내용",
      quote: "사례 연구는 합의된 요약을 초안 출판물에 연결합니다. 편집자는 의미와 제한 사항을 확인하므로 텍스트 생성이 고객과의 동의를 대체하지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 개요에 따라 프로젝트 카드와 초안을 수집합니다. 각 게시물은 근본적인 사실과 브랜드 제한 사항을 기준으로 평가되어야 합니다.",
      routineBefore: "원래 시나리오에서는 고객 요구 사항이 메시지와 문서에 분산되어 있습니다. 각 텍스트 이전에 마케팅 담당자는 제품 정보, 커뮤니케이션 톤 및 금지 목록을 수동으로 수집합니다.",
      resultAfter: "어셈블리의 대상 결과물: 단일 개요 및 관련 초안 출판물. 승인은 가상의 비용 절감이나 매출 증가가 아닌 소스 코드 준수 여부를 확인합니다.",
      videoSrc: 'assets/videos/student_04_a-marketolog.mp4', duration: '0:10', durationSeconds: 9.990083,
      codeword: "간략한",
      nextStep: "교육 경로에서 BRIF라는 단어를 요청하고 초안에 확인되지 않은 제품 속성이 추가되지 않았는지 확인하세요."
    },
    {
      id: 'student_05', roleId: 'a-magazin', name: "스베틀라나", age: 29, city: null,
      specialty: "꽃 워크숍",
      headline: "교육분석 · 꽃다발 주문에 대한 답변",
      quote: "이 튜토리얼은 꽃집에서 반복되는 질문에 답하는 데 중점을 둡니다. 꽃다발의 구성, 꽃의 가용성 및 배송 가능성을 직원이 확인하고 템플릿은 응답 형식을 지정하는 데 도움이 됩니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 주문 알림 및 답변 템플릿을 수집합니다. 수표에는 꽃의 가용성과 배송 일정에 따라 달라지는 정보가 별도로 표시됩니다.",
      routineBefore: "원래 시나리오에서 직원은 각각의 새로운 서신에서 주문 조건을 반복합니다. 준비된 답변이 너무 많은 것을 약속하지 않도록 꽃의 실제 가용성을 별도로 명확히해야합니다.",
      resultAfter: "대상 어셈블리 아티팩트: 가용성 및 배송에 대한 필수 확인이 포함된 주문 메모입니다. 이는 판매 증명이나 실시간 결제 작업이 아닌 검증 가능한 응답 구조입니다.",
      videoSrc: 'assets/videos/student_05_a-magazin.mp4', duration: '0:10', durationSeconds: 9.999083,
      codeword: "부케",
      nextStep: "교육 루트에서 BOUQUET이라는 단어를 물어보고 품절된 제품에 대한 답변을 확인하세요."
    },
    {
      id: 'student_06', roleId: 'a-prepod', name: "올가", age: null, city: null,
      specialty: "수학 교사",
      headline: "교육분석 · 검증된 솔루션을 통한 과제",
      quote: "튜토리얼 예제에서는 하나의 수학 주제에 대한 플래시카드 준비 과정을 살펴봅니다. 교사는 학생에게 카드를 주기 전에 독립적으로 문제를 해결하고 답을 확인합니다.",
      taskBuiltIn3Evenings: "$19를 위한 3일 저녁 학습 과제: 다양한 난이도와 키의 과제를 준비합니다. 교사는 각 솔루션을 확인하고 명확한 자체 테스트 기준이 포함된 카드를 보관합니다.",
      routineBefore: "원본 스크립트에서는 작업과 답변이 별도의 파일에 저장됩니다. 수업을 준비할 때 교사는 필요한 선택 항목을 수동으로 수집하고 답안을 다시 확인합니다.",
      resultAfter: "대상 빌드 아티팩트: 입증된 솔루션과 설명이 포함된 작업 카드. 수락에는 교사의 독립적인 결정이 포함되며, 학업 성취도의 변화는 별도의 관찰이 필요합니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "작업",
      nextStep: "훈련 경로에서 TASK라는 단어를 요청하고 생성기에 관계없이 각 작업에 대한 솔루션을 확인합니다."
    },
    {
      id: 'student_07', roleId: 'a-psiholog', name: "파벨", age: null, city: null,
      specialty: "코치",
      headline: "훈련심사·개인사연 없이 입국확인",
      quote: "이 튜토리얼에서는 업무 회의 약속을 확인하기 위한 템플릿을 보여줍니다. 이를 준비하려면 승인된 서비스 약관으로 충분하며 개인에 대한 민감한 정보는 필요하지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 등록 확인 및 이전 절차를 수집합니다. 회의 형식, 비용 및 이용 가능 날짜는 전문가가 확정한 조건에 의해서만 결정됩니다.",
      routineBefore: "원래 시나리오에서는 승인 레코드가 여러 메시지에서 수동으로 컴파일됩니다. 회의 일정을 변경할 때 시간대를 확인하거나 오래된 용어를 업데이트하는 것을 잊어버리기 쉽습니다.",
      resultAfter: "빌드 대상 아티팩트: 검증 가능한 확인 템플릿 및 별도의 기록 마이그레이션 스크립트. 이 테스트는 가상의 데이터를 사용하며 임상적 권장 사항을 제시하거나 결과를 약속하지 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "기록",
      nextStep: "교육 경로에서 APPOINTMENT라는 단어를 요청하고 고객의 개인 이력을 공유하지 않고 약속 일정을 변경하도록 확인하세요."
    },
    {
      id: 'student_08', roleId: 'a-novichok', name: "나데즈다", age: null, city: null,
      specialty: "초보 컨설턴트",
      headline: "교육적 분석 · 명확한 서비스 하나에 대한 설명",
      quote: "사례 연구는 모든 역량을 나열하지 않고도 하나의 서비스를 설명하는 데 도움이 됩니다. 텍스트에는 고객의 업무, 업무 범위 및 책임 범위가 설명되어 있으며 보장된 수입을 약속하지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 한 가지 서비스에 대한 카드를 발급합니다. 입력 데이터, 작업의 구체적인 결과 및 설명이 필요한 조건을 표시해야 합니다.",
      routineBefore: "원래 시나리오에서는 서비스 설명이 대화에서 대화로 변경됩니다. 매번 초보 전문가는 작품의 구성을 새롭게 설명하고 동일한 명확한 질문에 답합니다.",
      resultAfter: "어셈블리의 대상 가공물: 구성과 경계가 명확한 서비스 카드입니다. 이 테스트는 독자가 다음 단계를 설명할 수 있는지 여부를 판단하지만 요구 사항을 입증하지는 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "서비스",
      nextStep: "학습 경로에서 SERVICE라는 단어를 묻고 시험 독자에게 작품의 구성과 한계를 말하도록 요청하세요."
    },
    {
      id: 'student_09', roleId: 'a-marketolog', name: "키릴", age: null, city: null,
      specialty: "단편 영상 프로듀서",
      headline: "훈련 분석 · 단일 소스의 시나리오",
      quote: "튜토리얼은 하나의 승인된 자료를 여러 개의 스크립트된 코너로 바꿉니다. 각 비디오에는 자체 주제가 확인되어 있으므로 의역된 테이크 세트는 완성된 에피소드로 간주되지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 작업: 소스 코드를 기반으로 짧은 비디오용 스크립트를 만듭니다. 각 시나리오에는 입증된 사실과 명확한 다음 단계에 대한 링크가 함께 제공됩니다.",
      routineBefore: "초기 대본에서는 비디오의 주제가 완성된 프로젝트 자료와 별도로 만들어졌습니다. 제작자는 원본 사실을 수동으로 검색하고 대본이 작성된 후에만 반복을 알아차립니다.",
      resultAfter: "어셈블리의 대상 아티팩트: 다양한 논문 및 설명 소스가 포함된 시나리오 테이블입니다. 검증은 의미와 반복에 관한 것이며, 청중 보유는 출판 후에만 평가할 수 있습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "시나리오",
      nextStep: "학습 경로에서 SCENARIO라는 단어를 요청하고 다양한 동영상이 다양한 질문을 다루는지 확인하세요."
    },
    {
      id: 'student_10', roleId: 'a-magazin', name: "베라", age: null, city: null,
      specialty: "수리 작업장",
      headline: "교육 복습 · 수리 요청 카드",
      quote: "튜토리얼 예제에서는 명확한 사전 수리 요청 카드를 구성합니다. 비용과 마감일은 마스터가 견적을 낸 후 확정되며, 양식은 기성 견적으로 추측을 제공하지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 신청 카드와 영수증 확인을 준비합니다. 점검을 통해 오작동에 대한 설명과 가격 및 기간을 분리하므로 전문가의 평가가 필요합니다.",
      routineBefore: "원래 시나리오에서는 클라이언트의 짧은 메시지에서 오류에 대한 설명이 손실됩니다. 직원은 제품 모델, 문제의 성격 및 향후 의사소통을 위한 편리한 방법을 수동으로 지정합니다.",
      resultAfter: "대상 빌드 아티팩트: 올바른 다음 단계를 포함하는 구조화된 요청 및 응답. 테스트는 설명의 완전성을 확인하지만 기술 진단이나 견적 승인을 대체하지는 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "수리",
      nextStep: "훈련 경로에서 REPAIR라는 단어를 요청하고 템플릿이 마스터 없이 비용을 할당하지 않는지 확인합니다."
    },
    {
      id: 'student_11', roleId: 'a-prepod', name: "안드레이", age: null, city: null,
      specialty: "전문과정 교사",
      headline: "실기 1과에 대한 교육분석 체크리스트",
      quote: "사례 연구는 실제 작업과 명확한 준비 기준을 연결합니다. 선생님께서 체크리스트를 통해 작품 자체를 확인하시기 때문에 아름다운 디자인이 수업 내용을 대체하지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 지침 및 승인 체크리스트를 수집합니다. 각 항목마다 학생이 자신의 작업을 확인할 수 있는 관찰 가능한 표시가 필요합니다.",
      routineBefore: "원래 시나리오에서는 수업 시작 시 작업 기준을 구두로 설명합니다. 과제를 확인할 때 교사는 동일한 의견을 다시 작성하고 각 학생의 요구 사항을 명확히 합니다.",
      resultAfter: "대상 빌드 아티팩트: 작업 완료를 위한 예시와 검증 가능한 기준이 포함된 지침입니다. 수락은 시험 작업을 사용하며, 가속화된 학습에 대한 약속은 이 분석에 포함되지 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "연습",
      nextStep: "훈련 경로에서 PRACTICE라는 단어를 요청하고 명백히 불완전한 시험 작업에 대한 체크리스트를 확인하세요."
    },
    {
      id: 'student_12', roleId: 'a-psiholog', name: "이리나", age: null, city: null,
      specialty: "커리어 코치",
      headline: "교육세션 · 실무회의 안건",
      quote: "사례 연구에서는 사전에 합의된 작업 작업에 대한 회의 안건을 작성합니다. 토론 질문과 예상 문서가 포함되어 있지만 성격 진단이나 취업 약속은 없습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 의제 및 요약 메모를 위한 템플릿을 준비합니다. 전문가는 서비스 범위를 확인하고 고객의 개인정보를 생성자에게 전송하지 않습니다.",
      routineBefore: "원래 시나리오에서는 회의에 대한 질문이 다양한 작업 노트에 수집됩니다. 대화 후 전문가는 합의된 조치를 수동으로 재구성하고 이를 확인되지 않은 가정과 분리합니다.",
      resultAfter: "Build Target Artifact: 합의된 다음 작업을 캡처하기 위한 의제 및 템플릿입니다. 이 테스트는 문서의 구조에 관한 것이며 경력이나 심리적 결과는 여기에 명시되어 있지 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "의제",
      nextStep: "훈련 경로에서 AGENDA라는 단어를 요청하고 완전히 가상의 작업 상황에서 템플릿을 테스트합니다."
    },
    {
      id: 'student_13', roleId: 'a-novichok', name: "맥심", age: null, city: null,
      specialty: "독립적인 전문가",
      headline: "교육분석 · 자신의 자료를 바탕으로 답변",
      quote: "훈련 예시는 전문가가 직접 작성한 자료에서 질문에 대한 답변을 수집합니다. 각 진술은 특정 출처와 연관되어 있으며 공백은 허구의 답변 대신 작성자를 위한 질문으로 남아 있습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 저자의 자료를 바탕으로 작은 참고서를 수집합니다. 각 답변에 대해 소스를 저장하고 확인되지 않은 추가 사항이 있는지 확인해야 합니다.",
      routineBefore: "원본 대본에는 필요한 설명이 문서와 메모 곳곳에 흩어져 있습니다. 전문가는 이전 답변을 수동으로 검색하고 문구의 관련성을 다시 확인한 후 전송합니다.",
      resultAfter: "Target Build Artifact: 소스 자료 및 제한 사항에 대한 답변 가이드입니다. 출처가 없는 시험 문제는 설득력 있는 허구를 생성하는 것이 아니라 격차를 드러내야 합니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "답변",
      nextStep: "학습 경로에서 ANSWER라는 단어를 물어보고, 원본 자료에 없는 질문을 확인하세요."
    },
    {
      id: 'student_14', roleId: 'a-marketolog', name: "올레시아", age: null, city: null,
      specialty: "교육 프로젝트 제작자",
      headline: "교육 분석 · 승인된 출판물 대기열",
      quote: "사례 연구는 출판을 위한 자료의 초안 작성, 승인 및 준비를 분리합니다. 담당자와 최신 버전이 카드에 표시되며 배치 사실로 준비 표시가 발행되지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 훈련 과제: 명시적인 상태가 있는 자료 대기열을 수집합니다. 각 텍스트마다 출처, 책임 편집자 및 별도의 출판 허가를 기록해야 합니다.",
      routineBefore: "원본 대본에서는 작업 서신에 편집 내용과 최종 텍스트가 혼합되어 있습니다. 제작자는 어떤 버전이 승인되고 누가 다음 자료를 검토해야 하는지 수동으로 파악합니다.",
      resultAfter: "대상 빌드 아티팩트: 버전, 상태 및 조정자가 포함된 대기열입니다. 검사는 확인되지 않은 상태를 포착하지만 채널의 자동 배치가 작동하는지 증명하지는 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "대기열",
      nextStep: "훈련 경로에서 QUEUE라는 단어를 요청하고 일치하지 않는 텍스트를 게시할 수 없는지 확인하세요."
    },
    {
      id: 'student_15', roleId: 'a-magazin', name: "로마인", age: null, city: null,
      specialty: "작은 빵집",
      headline: "튜토리얼 · 선주문 알림",
      quote: "사례 연구에서는 소규모 빵집에 대한 선주문 알림을 만듭니다. 알레르기 항원에 대한 범위, 구성 및 정보는 직원이 확인하며 생성기는 구운 식품의 특성을 만들어 내지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 훈련 과제: 확인된 빵집 데이터에서 메모를 수집합니다. 제품 구성, 주문 확인 절차, 수령 조건의 타당성은 별도로 확인됩니다.",
      routineBefore: "원래 시나리오에서 고객은 분류 및 주문 영수증에 대해 동일한 질문을 합니다. 직원은 작업 카드를 사용하여 수동으로 조건을 다시 설명하고 각 제품의 구성을 확인합니다.",
      resultAfter: "타겟 빌드 아티팩트: 정보 소스 및 필수 주문 확인이 포함된 메모입니다. 수표에는 알레르기 항원에 대한 질문이 포함되어 있지만 담당 직원의 구성 관리를 대체하지는 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "선주문",
      nextStep: "교육 경로에서 PRE-ORDER라는 단어를 요청하고 승인된 제품 카드와 구성에 대한 질문을 확인하세요."
    },
    {
      id: 'student_16', roleId: 'a-prepod', name: "안나", age: null, city: null,
      specialty: "추가 교육 교사",
      headline: "교육 분석 · 수업 사실에 대해 학부모에게 알리는 메모",
      quote: "교육 사례는 비개인적인 수업 노트를 부모에게 전달하는 이해하기 쉬운 메시지 초안으로 바꿉니다. 교사는 관찰을 통해 각 공식을 확인하며 아동의 성격에 대한 평가를 추가하지 않습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 수업 결과를 바탕으로 메시지 템플릿을 준비합니다. 테스트에는 아동의 이름, 사진, 개인 데이터가 포함되지 않은 가상의 기록이 사용됩니다.",
      routineBefore: "원래 시나리오에서는 교사가 수업이 끝난 후 부모에게 보내는 유사한 메시지를 수동으로 작성합니다. 완료된 과제, 학생의 난이도, 합의된 가정 연습 단계를 별도로 기억해야 합니다.",
      resultAfter: "빌드의 대상 아티팩트: 수업 내용과 다음 연습 내용이 포함된 초안 메시지입니다. 교사는 보내기 전에 사실을 확인하지만 템플릿은 아이의 능력에 대한 결론을 내리지 않습니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "활동",
      nextStep: "학습 경로에서 ACTIVITY라는 단어를 요청하고 초안이 지정된 관찰 내용만 저장했는지 확인하세요."
    },
    {
      id: 'student_17', roleId: 'a-psiholog', name: "세르게이", age: null, city: null,
      specialty: "개인 진료를 하는 심리학자",
      headline: "교육 검토 · 업무 형식에 대한 공개 답변",
      quote: "사례 연구는 전문가의 작업 형식에 대한 대중의 반응을 수집합니다. 질문은 회의 구성 및 서비스 경계와 관련되므로 개인 서신 및 임상 사례는 수집에 포함되지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 승인된 규칙에 따라 조직 문제 섹션을 준비합니다. 전문가는 문구를 확인하고 일반 항목과 긴급 도움 요청을 구분합니다.",
      routineBefore: "원래 시나리오에서는 작업 형식에 대한 설명이 여러 오래된 출판물에서 발견되었습니다. 전문가는 반복되는 질문에 수동으로 답변하고 답변이 현재 규칙과 일치하는지 확인합니다.",
      resultAfter: "대상 빌드 아티팩트: 작업 조직 및 통신 경계에 대한 검증된 질문 섹션입니다. 리셉션에서는 진단 및 치료 권장 사항을 생략하고 민감한 요청을 합의된 프로세스로 전달합니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "형식",
      nextStep: "훈련 경로에서 FORMAT이라는 단어를 요청하고 그 대답이 전문가의 도움을 대체하지 않는지 확인하십시오."
    },
    {
      id: 'student_18', roleId: 'a-novichok', name: "줄리아", age: null, city: null,
      specialty: "작은 실용적인 제품의 저자",
      headline: "훈련 분석 · 첫 번째 템플릿에 대한 지침",
      quote: "튜토리얼 예제는 소규모 작업 템플릿에 대한 지침을 다룹니다. 테스트 리더는 입력 데이터를 이해하고 결과를 확인해야 하며, 화려한 약속은 명확한 절차를 대체할 수 없습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 학습 과제: 자신의 템플릿 중 하나를 사용하는 방법을 설명합니다. 지침에는 완성된 예, 제한 사항 및 결과 준비 여부를 확인하는 표시가 포함되어 있습니다.",
      routineBefore: "원본 대본에서 저자는 각 독자에게 패턴의 사용법을 별도로 설명합니다. 필드 작성, 절차 및 수신된 작업 문서 확인에 대한 질문이 반복됩니다.",
      resultAfter: "대상 빌드 아티팩트: 완성된 예제 및 자체 테스트 기준이 포함된 지침입니다. 새로운 독자를 대상으로 테스트하면 불분명한 부분이 드러날 수 있지만 향후 판매에 대한 증거는 아닙니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "템플릿",
      nextStep: "학습 경로에서 PATTERN이라는 단어를 요청하고 작성자의 요청 없이 데모 데이터에 대한 지침을 진행합니다."
    },
    {
      id: 'student_19', roleId: 'a-marketolog', name: "폴리나", age: null, city: null,
      specialty: "콘텐츠 마케터",
      headline: "교육적 분석 · 허위번호가 없는 사례",
      quote: "훈련 예시는 완료된 작업에 대한 자료의 편집 검토를 보여줍니다. 초안은 확인된 사실과 알 수 없는 결과를 별도로 식별하므로 누락된 측정항목이 화려한 숫자로 대체되지 않습니다.",
      taskBuiltIn3Evenings: "$19에 대한 3일 저녁 교육 과제: 승인된 재료를 사용하여 케이스 프레임을 조립합니다. 각 문은 소스와 연결되어 있으며 지원되지 않는 표시는 완성된 텍스트에서 제외됩니다.",
      routineBefore: "원래 시나리오에서는 프로젝트에 대한 정보가 서로 다른 작업 문서에서 수집됩니다. 편집자는 어떤 주장이 검증되었는지, 어떤 자료가 공개적으로 표시되도록 허용되었는지 수동으로 확인합니다.",
      resultAfter: "어셈블리의 대상 아티팩트: 입증된 내용의 소스와 명확한 경계가 포함된 초안 사례입니다. 검증은 검증되지 않은 지표를 제거하며, 게시 권한은 별도의 필수 조건으로 유지됩니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "사례",
      nextStep: "학습 경로에서 CASE라는 단어를 요청하고 출처 없이 단 하나의 그림도 남지 않았는지 확인하세요."
    },
    {
      id: 'student_20', roleId: 'a-magazin', name: "미하일", age: null, city: null,
      specialty: "지역 서비스 스튜디오",
      headline: "교육분석 · 녹음 및 전송에 대한 답변",
      quote: "사례 연구에서는 지역 서비스 스튜디오에 글을 쓴 것에 대한 응답을 설명합니다. 자유시간 및 환승 조건은 관리자가 확인하며, 템플릿에서는 존재하지 않는 예약이 생성되지 않습니다.",
      taskBuiltIn3Evenings: "$19의 3일 저녁 학습 과제: 녹음 및 전송에 대한 답변을 준비합니다. 확인은 클라이언트의 요청과 확인된 시간을 분리하며 연결 ​​없이 자동 녹음을 약속하지 않습니다.",
      routineBefore: "원래 시나리오에서는 관리자가 새 방문자에게 입장 조건을 수동으로 반복합니다. 이관 시 일정을 다시 확인하고 실제로 생산 시스템에 변경이 이루어졌는지 확인해야 합니다.",
      resultAfter: "대상 빌드 아티팩트: 일정 변경을 별도로 확인하는 응답 템플릿입니다. 테스트를 통해 허위 예약이 없는지 확인하고, 별도의 점검을 통해 실제 통합 작동을 확인합니다.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "시간",
      nextStep: "훈련 경로에서 TIME이라는 단어를 물어보고 확인되지 않은 요청이 예약이라고 표시되지 않는지 확인합니다."
    }
  ];

  const disclosure = "실제 고객의 리뷰가 아닌 가상의 캐릭터를 사용한 교육 사례입니다. 검증된 학생 결과가 아닌 실제적인 조립 계획을 설명합니다.";
  window.COLIBRIOS_REVIEWS_20 = Object.freeze(cases.map(item => Object.freeze({
    ...item,
    roleLabel: roleLabels[item.roleId],
    posterSrc: 'assets/portraits/' + item.id + '.webp',
    audioSrc: null,
    mediaType: item.videoSrc ? 'role-avatar-video' : 'text-case',
    caseType: 'illustrative-educational-scenario',
    disclosure,
    identityStatus: 'persona-label-not-verified-customer',
    ageProvenance: item.age === null ? 'not-provided' : 'existing-voice-persona-production-brief',
    cityProvenance: 'not-provided',
    quoteKind: 'editorial-summary-not-verbatim-testimonial',
    isVerifiedTestimonial: false,
    completionVerified: false,
    resultStatus: 'acceptance-target-not-measured-outcome',
    codewordStatus: 'proposed-training-trigger-not-live-verified',
    videoTranscriptVerified: false,
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    priceRUB: 990,
    evenings: 3
  })));

  window.COLIBRIOS_BROLL_SHOWCASE = Object.freeze([
    {
      id: 'broll_01', title: "수영장 옆의 Denys Viet",
      caption: "프로젝트의 시각적 표현을 익히기 위한 수직 조각입니다. 이 비디오는 학생의 성과나 작업 완료 속도를 보증하지 않습니다.",
      videoSrc: 'assets/videos/broll_01_dennis_pool_29s.mp4',
      posterSrc: 'assets/videos/broll_01_dennis_pool_29s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:29', durationSeconds: 28.6
    },
    {
      id: 'broll_02', title: "Tatiana Colibri · 발코니",
      caption: "프로젝트에 대한 블록에 대한 Tatiana Colibri의 수직 조각입니다. 클립은 수익이나 고객 결과에 대한 증거가 아닌 시각적 프레젠테이션입니다.",
      videoSrc: 'assets/videos/broll_02_tatiana_balcony_10s.mp4',
      posterSrc: 'assets/videos/broll_02_tatiana_balcony_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_03', title: "Denys Viet · 주방",
      caption: "프로젝트 홈 시리즈의 짧은 수직 조각입니다. 중단으로 사용할 수는 있지만 입증된 자동화의 기록으로 넘길 수는 없습니다.",
      videoSrc: 'assets/videos/broll_03_dennis_kitchen_10s.mp4',
      posterSrc: 'assets/videos/broll_03_dennis_kitchen_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_04', title: "Tatiana Colibri · 홈 프레임",
      caption: "홈 시리즈의 Tatiana Colibri가 포함된 짧은 수직 조각입니다. 수익에 대한 약속이나 확인되지 않은 성과 지표 없이 프로젝트에 대한 이야기를 보완합니다.",
      videoSrc: 'assets/videos/broll_04_tatiana_sofa_10s.mp4',
      posterSrc: 'assets/videos/broll_04_tatiana_sofa_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_05', title: "라이브 캐러셀 · 첫 번째 옵션",
      caption: "애니메이션 조각은 캐러셀 피드 옵션 중 하나를 보여줍니다. 이는 샘플 형식이며 적용 범위, 애플리케이션 또는 지불 경로 운영을 보증하는 것이 아닙니다.",
      videoSrc: 'assets/videos/broll_05_living_carousel_s1.mp4',
      posterSrc: 'assets/videos/broll_05_living_carousel_s1.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_06', title: "라이브 캐러셀 · 두 번째 옵션",
      caption: "두 번째 애니메이션 조각은 캐러셀 피드 옵션을 비교하는 데 도움이 됩니다. 크기는 완성된 파일을 기준으로 표시되며 본 예시에서는 프로모션 결과를 측정하지 않았습니다.",
      videoSrc: 'assets/videos/broll_06_living_carousel_s2.mp4',
      posterSrc: 'assets/videos/broll_06_living_carousel_s2.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_07', title: "Denys Viet · 홈 시리즈",
      caption: "사이트 섹션 간 전환을 위한 또 다른 수직 조각입니다. 이는 고객 피드백이 아니며 표시된 작업 흐름의 검토를 대체하지 않습니다.",
      videoSrc: 'assets/videos/broll_07_dennis_bedroom_10s.mp4',
      posterSrc: 'assets/videos/broll_07_dennis_bedroom_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_08', title: "Denys Viet · 프레임 전환",
      caption: "수직 조각은 프로젝트의 시각적 중단의 홈 시리즈를 완성합니다. 클립은 스토리 탐색을 보완하지만 시간이나 비용 절감에 대한 증거를 제공하지는 않습니다.",
      videoSrc: 'assets/videos/broll_08_dennis_hallway_10s.mp4',
      posterSrc: 'assets/videos/broll_08_dennis_hallway_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    }
  ].map(item => Object.freeze({
    ...item,
    mediaType: 'broll-showcase',
    evidenceType: 'format-demonstration-not-customer-proof',
    transcriptVerified: false,
    publicationStatus: 'existing-media-approval-not-certified-by-this-dataset'
  })));

  window.COLIBRIOS_REVIEWS_METADATA = Object.freeze({
    schemaVersion: '1.0.0',
    language: 'ru',
    brandName: "Tatiana Colibri & Denys Viet",
    title: "5가지 역할에 대한 20회의 교육 세션",
    disclosure,
    quotePolicy: 'Editorial summaries are not customer quotations or video transcripts.',
    identityPolicy: 'Names are persona labels, not authenticated customer identities. Unknown ages and cities are null.',
    resultPolicy: 'Before/after fields describe a scenario and acceptance target, not measured outcomes.',
    durationPolicy: 'Measured container duration is in seconds. Text-only cards have no audio/video duration.',
    pathBase: 'project-root',
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    mandatory5RoundsVerified: false,
    sourceRefs: Object.freeze([
      'goal-objective.md#3',
      'assets/config.js',
      'role_avatars_20261024/role_avatars_manifest.json',
      'role_avatars_20261024/distinct_voices_48k/voice_differentiation_receipt.json',
      'role_avatars_20261024/memo_voice_revision/content/memos.json',
      'notebooklm:9bb2ba3a-e275-4fe7-a03e-6595762ab87d/697783d7-330a-4f6f-8001-87b58787b2f5'
    ])
  });
})();
