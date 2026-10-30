'use strict';
/* Public editorial data, not a record of customer testimonials.
 * Persona names identify educational scenarios. Only the first five persona
 * ages have a production-source reference; all unknown ages/cities stay null.
 * Text summaries are not transcripts of the associated role-avatar videos.
 * Relative media URLs are project-root-relative, not script-relative.
 */
(() => {
  const roleLabels = Object.freeze({
    'a-prepod': "导师和老师",
    'a-psiholog': "心理学家和教练",
    'a-novichok': "专家和新手",
    'a-marketolog': "营销商和生产商",
    'a-magazin': "商店和服务"
  });

  const cases = [
    {
      id: 'student_01', roleId: 'a-prepod', name: "埃琳娜", age: 34, city: null,
      specialty: "英语家教",
      headline: "教育回顾·提醒代替重复解释",
      quote: "该教育示例显示了用英语进行简短介绍的提醒。这里讨论的不是成功故事，而是示例答案、学生作业以及老师的测试。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：准备一份带有样本的备忘录、练习和自测。最后一步，老师检查词汇并保存批准的版本。",
      routineBefore: "在原来的场景中，老师每次都会重新解释简短介绍的结构。示例答案保留在不同的注释中，因此您必须手动搜索合适的示例。",
      resultAfter: "目标构建工件：一份经过测试的备忘单，包含练习和示例。在测试请求中，您需要检查所需版本的输出，而不是承诺提高评级。",
      videoSrc: 'assets/videos/student_01_a-prepod.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "课程",
      nextStep: "在培训路线中，发送单词 LESSON 并检查测试请求上的提醒的发出情况。"
    },
    {
      id: 'student_02', roleId: 'a-psiholog', name: "码头", age: 41, city: null,
      specialty: "心理学家",
      headline: "培训会·第一次会议规则",
      quote: "该案例研究涉及第一次会议之前的组织备忘录。它检查格式、时区和传输订单，并且不使用个人客户故事。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：根据批准的记录规则收集一份备忘录。专家在允许发布文本之前独立澄清未知情况。",
      routineBefore: "在最初的场景中，相同的组织问题有不同的对应关系。专家手动检查预约时间并重复约定的安排和重新安排规则。",
      resultAfter: "目标构建工件：商定的文本以及组织问题的答案。审查涉及规则和隐私的准确性，而不是诊断或治疗结果。",
      videoSrc: 'assets/videos/student_02_a-psiholog.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "会议",
      nextStep: "在培训路线中，询问“会议”一词，并根据专家批准的规则检查备忘录。"
    },
    {
      id: 'student_03', roleId: 'a-novichok', name: "伊戈尔", age: 44, city: null,
      specialty: "专家，第一个内容项目",
      headline: "教育分析·语音留言帖子",
      quote: "案例研究以专家用自己的话写下的解释开始。一篇文章的草稿是根据注释编写的，事实和措辞仍有待作者检查。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：抄写自己的笔记并准备一篇文章。然后，作者根据来源检查声明并仅保存批准的文本。",
      routineBefore: "在最初的场景中，有用的解释保留在手机的语音注释中。在发布之前，专家会重新输入文本并手动删除草稿中的重复想法。",
      resultAfter: "目标构建工件：原始注释和具有相同主题的审阅帖子。出版仍然是作者的个人决定，这里没有衡量收入和影响力。",
      videoSrc: 'assets/videos/student_03_a-novichok.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "注意",
      nextStep: "在学习路线中，询问单词“NOTE”并将每个帖子陈述与原始帖子进行比较。"
    },
    {
      id: 'student_04', roleId: 'a-marketolog', name: "阿丽娜", age: 25, city: null,
      specialty: "营销人员",
      headline: "培训分析·内容来自商定的简报",
      quote: "案例研究将商定的摘要与出版物草稿联系起来。编辑会检查含义和限制，因此文本生成并不能取代与客户的协议。",
      taskBuiltIn3Evenings: "三晚$19的培训任务：收集项目卡并根据简介起草。每个帖子都需要根据基本事实和品牌限制进行权衡。",
      routineBefore: "在原始场景中，客户需求分散在消息和文档中。在每次发短信之前，营销人员都会手动收集产品信息、沟通语气和禁令列表。",
      resultAfter: "大会的目标工件：一份简报和相关的出版物草稿。验收检查是否符合源代码，而不是虚构的成本降低或销售额增加。",
      videoSrc: 'assets/videos/student_04_a-marketolog.mp4', duration: '0:10', durationSeconds: 9.990083,
      codeword: "BRIF",
      nextStep: "在训练路线中，询问BRIF这个词，并检查草稿没有添加未经确认的产品属性。"
    },
    {
      id: 'student_05', roleId: 'a-magazin', name: "斯韦特兰娜", age: 29, city: null,
      specialty: "花卉工作坊",
      headline: "教育分析·订购花束的解答",
      quote: "本教程的重点是回答花卉研讨会中反复出现的问题。花束的构成、鲜花的可用性以及交付的可能性均由员工确认，模板有助于格式化响应。",
      taskBuiltIn3Evenings: "三晚$19的学习任务：收集订单提醒和答案模板。支票上会单独注明取决于鲜花供应情况和送货时间表的信息。",
      routineBefore: "在原始场景中，员工在每封新信件中重复订单条款。鲜花的实际供应情况必须单独澄清，这样现成的答案就不会承诺太多。",
      resultAfter: "目标组装工件：订单备忘录，强制确认可用性和交付。这是可验证的响应结构，而不是销售证明或实时结账操作。",
      videoSrc: 'assets/videos/student_05_a-magazin.mp4', duration: '0:10', durationSeconds: 9.999083,
      codeword: "花束",
      nextStep: "在培训路线中，询问“BOUQUET”一词并检查缺货产品的答案。"
    },
    {
      id: 'student_06', roleId: 'a-prepod', name: "奥尔加", age: null, city: null,
      specialty: "数学导师",
      headline: "教育分析·具有经过验证的解决方案的任务",
      quote: "教程示例检查了一个数学主题的抽认卡的准备过程。老师独立解决任务并检查答案，然后将卡片交给学生。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：准备不同难度和重点的任务。老师检查每个答案并保留一张带有明确自测标准的卡片。",
      routineBefore: "在原始脚本中，任务和答案存储在单独的文件中。备课时，教师手动收集所需选题并重新核对答案。",
      resultAfter: "目标构建工件：包含经过验证的解决方案和解释的任务卡。录取涉及老师的独立决定，学习成绩的变化需要单独观察。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "任务",
      nextStep: "在训练路线中，询问单词 TASK 并检查每个任务的解决方案，无论生成器如何。"
    },
    {
      id: 'student_07', roleId: 'a-psiholog', name: "帕维尔", age: null, city: null,
      specialty: "教练",
      headline: "培训审核·确认入职，无需个人故事",
      quote: "本教程展示了用于确认工作会议预约的模板。为了准备它，批准的服务条款就足够了，并且不需要有关该人的敏感信息。",
      taskBuiltIn3Evenings: "三晚$19的培训任务：收集注册确认书和转学手续。会议形式、费用和可用日期仅取自专家确认的条件。",
      routineBefore: "在原始场景中，确认记录是根据多条消息手动编译的。重新安排会议时，很容易忘记检查时区或更新过时的条款。",
      resultAfter: "构建目标工件：可验证的确认模板和单独的记录迁移脚本。该测试使用虚构数据，不提出临床建议或承诺结果。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "记录",
      nextStep: "在培训路线中，询问“预约”一词并检查以重新安排预约，而无需分享客户的个人历史记录。"
    },
    {
      id: 'student_08', roleId: 'a-novichok', name: "纳德日达", age: null, city: null,
      specialty: "新手顾问",
      headline: "教育分析 · 一项明确服务的描述",
      quote: "案例研究有助于描述一项服务，而无需列出所有能力。文字概述了客户的任务、工作范围和责任界限，但不承诺保证收入。",
      taskBuiltIn3Evenings: "三晚$19的训练任务：发卡一次。需要表明输入数据、工作的具体结果以及需要澄清的条件。",
      routineBefore: "在原始场景中，服务描述随着对话的不同而变化。每次，新手专家都会重新解释作品的组成并回答相同的澄清问题。",
      resultAfter: "装配的目标工件：构成和边界清晰的服务卡。该测试确定读者是否可以解释下一步，但不证明需求。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "服务",
      nextStep: "在学习路线中，询问“SERVICE”一词，并要求测试读者说出作品的构成和局限性。"
    },
    {
      id: 'student_09', roleId: 'a-marketolog', name: "基里尔", age: null, city: null,
      specialty: "短视频制作人",
      headline: "培训分析·一站式场景",
      quote: "本教程将一种经过批准的材料转变为几个有脚本的角落。每个视频都有自己的论文检查，因此一组释义片段不被视为完成的剧集。",
      taskBuiltIn3Evenings: "三晚$19的训练任务：根据源码制作短视频脚本。每个场景都附有已证实事实的链接和明确的下一步。",
      routineBefore: "在最初的脚本中，视频的主题是与完成的项目材料分开设计的。制片人手动搜索原始事实，并在剧本写完后才注意到重复。",
      resultAfter: "程序集的目标工件：具有不同主题和语句来源的场景表。验证涉及意义和重复，受众保留率只能在发布后进行评估。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "场景",
      nextStep: "在学习路线中，询问“场景”一词，并检查不同的视频是否涵盖了不同的问题。"
    },
    {
      id: 'student_10', roleId: 'a-magazin', name: "维拉", age: null, city: null,
      specialty: "维修车间",
      headline: "培训审核·报修卡",
      quote: "本教程示例组装了清晰的预维修请求卡。费用和期限是在师傅估算后确定的，表格中并没有给出一个猜测作为现成的估算。",
      taskBuiltIn3Evenings: "三晚$19的培训任务：准备申请卡和收据确认书。检查将故障描述与价格和时间范围分开，这需要专家进行评估。",
      routineBefore: "在原来的场景中，故障的描述在客户端的短信中丢失了。员工手动指定产品型号、问题的性质以及进一步沟通的便捷方法。",
      resultAfter: "目标构建工件：结构化请求和响应以及正确的下一步。该测试检查描述的完整性，但不能取代技术诊断或估计的批准。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "修复",
      nextStep: "在培训路线中，询问单词 REPAIR 并检查模板是否在没有大师的情况下分配成本。"
    },
    {
      id: 'student_11', roleId: 'a-prepod', name: "安德烈", age: null, city: null,
      specialty: "专业课程老师",
      headline: "一堂实践课的教育分析清单",
      quote: "该案例研究将实际任务与明确的准备标准联系起来。老师使用检查表检查作业本身，因此漂亮的设计并不能取代课程内容。",
      taskBuiltIn3Evenings: "三晚$19的培训任务：收集说明书和验收清单。对于每个项目，都需要一个可观察的标志，学生可以通过它来检查他的作业。",
      routineBefore: "在最初的场景中，任务标准是在课程开始时口头解释的。检查作业时，老师再次写下同样的批语，对每个学生明确要求。",
      resultAfter: "目标构建工件：带有示例和完成任务的可验证标准的说明。验收使用试验工作，加速学习的承诺不包括在本分析中。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "练习",
      nextStep: "在训练路线中，要求“PRACTICE”一词，并检查明显不完整的试验工作的清单。"
    },
    {
      id: 'student_12', roleId: 'a-psiholog', name: "伊琳娜", age: null, city: null,
      specialty: "职业教练",
      headline: "培训会议·工作会议议程",
      quote: "该案例研究为预先商定的工作任务制定了会议议程。它包含一个讨论问题和一份预期文件，但没有性格诊断或就业承诺。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：准备一个议程和总结笔记的模板。专家会检查服务的边界，并且不会将客户的个人信息传输给生成器。",
      routineBefore: "在原始场景中，会议的问题收集在不同的工作笔记中。对话结束后，专家手动重建商定的行动，并将其与未经证实的假设分开。",
      resultAfter: "构建目标工件：用于捕获商定的下一步行动的议程和模板。测试涉及文档的结构，职业或心理结果在此不予说明。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "议程",
      nextStep: "在培训路线中，询问“议程”一词并在完全虚构的工作情况下测试模板。"
    },
    {
      id: 'student_13', roleId: 'a-novichok', name: "马克西姆", age: null, city: null,
      specialty: "独立专家",
      headline: "教育分析·根据自己的材料作答",
      quote: "训练示例从专家自己的材料中收集问题的答案。每个陈述都与特定来源相关联，并且空格仍然是作者的问题，而不是虚构的答案。",
      taskBuiltIn3Evenings: "三晚学习任务$19：根据作者资料收集一本小工具书。对于每个答案，您需要保存来源并检查是否有任何未经确认的添加。",
      routineBefore: "在原始脚本中，必要的解释分散在文档和注释中。专家手动搜索之前的答案并在发送前重新检查措辞的相关性。",
      resultAfter: "目标构建工件：有关源材料和限制的答案指南。一个无来源的测试问题应该揭示一个差距，而不是产生一个令人信服的虚构。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "答案",
      nextStep: "在学习路线中，询问单词“ANSWER”并检查源材料中没有的问题。"
    },
    {
      id: 'student_14', roleId: 'a-marketolog', name: "奥莱西亚", age: null, city: null,
      specialty: "教育项目制作人",
      headline: "教育分析·批准出版物队列",
      quote: "该案例研究将材料的起草、批准和准备出版分开。负责人和当前版本在卡上可见，并且就绪标记不会作为放置的事实而发出。",
      taskBuiltIn3Evenings: "三个晚上$19的训练任务：收集一系列状态明确的材料。对于每篇文本，您需要记录来源、责任编辑和单独的出版许可。",
      routineBefore: "在原始剧本中，编辑和最终文本混合在工作信件中。制作人手动确定哪个版本获得批准以及谁应该审查下一个材料。",
      resultAfter: "目标构建工件：包含版本、状态和协调器的队列。该检查捕获了未确认的状态，但并不能证明通道中的自动放置有效。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "队列",
      nextStep: "在训练路线中，询问单词QUEUE，并确保不一致的文本不能被称为已发布。"
    },
    {
      id: 'student_15', roleId: 'a-magazin', name: "罗马", age: null, city: null,
      specialty: "小面包店",
      headline: "教程·预购提醒",
      quote: "该案例研究为一家小面包店创建了预订提醒。有关过敏原的范围、成分和信息均由员工确认，生成者并没有发明烘焙食品的特性。",
      taskBuiltIn3Evenings: "三个晚上的训练任务 $19：从已确认的面包店数据中收集备忘录。产品的组成、订单确认程序以及收货条款的相关性均单独检查。",
      routineBefore: "在最初的场景中，客户会询问有关分类和订单接收的相同问题。员工使用工作卡手动重新计算条件并检查每种产品的成分。",
      resultAfter: "目标构建工件：包含信息来源和强制订单确认的备忘录。检查包括有关过敏原的问题，但不能取代负责任的员工对成分的控制。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "预购",
      nextStep: "在培训路线中，要求输入“预购”一词，并根据批准的产品卡检查有关成分的问题。"
    },
    {
      id: 'student_16', roleId: 'a-prepod', name: "安娜", age: null, city: null,
      specialty: "附加教育老师",
      headline: "教育分析·给家长的关于课程事实的说明",
      quote: "教学示例将非个人化的课堂笔记转化为易于理解的草稿信息给家长。老师通过观察来检查每个表述，并且不会添加对孩子性格的评估。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：根据课程结果准备一个消息模板。为了进行测试，使用了虚构的记录，没有儿童的姓名、照片和个人数据。",
      routineBefore: "在最初的场景中，老师在课后手动撰写类似的消息给家长。你需要分别记住已完成的任务、学生的难度以及约定的家庭练习步骤。",
      resultAfter: "构建的目标工件：包含课程事实和以下练习的消息草稿。老师在发送前检查事实，但模板并没有对孩子的能力得出结论。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "活动",
      nextStep: "在研究路线中，请求单词“活动”并检查草稿是否仅保存了指定的观察结果。"
    },
    {
      id: 'student_17', roleId: 'a-psiholog', name: "谢尔盖", age: null, city: null,
      specialty: "私人执业心理学家",
      headline: "培训回顾·工作形式公开解答",
      quote: "该案例研究收集了公众对专家工作形式的回应。这些问题涉及会议的组织和服务的范围，因此个人信件和临床病例不包含在收集中。",
      taskBuiltIn3Evenings: "三晚$19的培训任务：按照批准的规则准备一段组织问题。专家会检查措辞，并将常规输入与紧急帮助呼叫分开。",
      routineBefore: "在最初的场景中，工作格式的描述可以在一些过时的出版物中找到。专家手动回答重复的问题并确保答案符合当前规则。",
      resultAfter: "目标构建工件：有关工作组织和沟通边界的问题的验证部分。接待处消除了诊断和治疗建议，并将敏感请求引导至商定的流程。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "格式",
      nextStep: "在培训路线中，询问“格式”一词，并检查答案是否不会取代专业帮助。"
    },
    {
      id: 'student_18', roleId: 'a-novichok', name: "朱莉娅", age: null, city: null,
      specialty: "一个小实用产品的作者",
      headline: "训练分析·第一个模板说明",
      quote: "本教程示例专门介绍小型工作模板的说明。测试读者必须理解输入数据并验证结果，花哨的承诺并不能代替清晰的程序。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：描述你自己的模板之一的使用。这些说明包括完整的示例、限制和用于检查结果准备情况的标志。",
      routineBefore: "在原脚本中，作者分别向每个读者解释了该模式的用法。有关填写字段、程序和检查收到的工作文件的问题不断重复。",
      resultAfter: "目标构建工件：包含完整示例和自测试标准的说明。使用新阅读器进行测试将揭示不清楚的部分，但不会成为未来销售的证据。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "模板",
      nextStep: "在训练路线中，询问单词 PATTERN 并在没有作者提示的情况下完成演示数据上的说明。"
    },
    {
      id: 'student_19', roleId: 'a-marketolog', name: "波琳娜", age: null, city: null,
      specialty: "内容营销人员",
      headline: "教育分析·无虚构数字的案例",
      quote: "培训示例显示了有关已完成工作的材料的编辑审查。该草案分别确定了已确认的事实和未知的结果，因此缺失的指标不会被奇特的数字所取代。",
      taskBuiltIn3Evenings: "三个晚上的培训任务 $19：使用批准的材料组装箱体框架。每个陈述都与一个来源相关联，不支持的指标将从最终文本中排除。",
      routineBefore: "在最初的场景中，有关项目的信息是从不同的工作文档中收集的。编辑手动验证哪些声明得到验证以及哪些材料被允许公开展示。",
      resultAfter: "装配的目标工件：一个草稿案例，其中包含已证明的来源和明确的边界。验证删除了未经验证的指标，发布权仍然是一个单独的强制性条件。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "案例",
      nextStep: "在学习路线中，询问CASE这个词，并检查没有一个数字是没有来源的。"
    },
    {
      id: 'student_20', roleId: 'a-magazin', name: "米哈伊尔", age: null, city: null,
      specialty: "本地服务工作室",
      headline: "教育分析·录音转学解答",
      quote: "该案例研究描述了给当地服务工作室写信的反应。空闲时间和转乘条件由管理员确认，模板不会创建不存在的预订。",
      taskBuiltIn3Evenings: "三个晚上$19的学习任务：准备关于录音和传输的答案。该检查将客户端的请求与确认的时间分开，并且不承诺在没有连接的情况下自动录制。",
      routineBefore: "在原始场景中，管理员手动向新访客重复进入条件。转移时，您需要重新检查计划并确认确实对生产系统进行了更改。",
      resultAfter: "构建目标工件：响应模板，并单独确认计划更改。测试验证不存在虚假预订，并通过单独检查确认真实集成的运行。",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "时间",
      nextStep: "在训练路线中，询问“TIME”一词，并检查未确认的请求不称为预订。"
    }
  ];

  const disclosure = "具有虚构角色的训练示例，而不是来自真实客户的评论。描述了实际的装配计划，而不是经过验证的学生结果。";
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
      id: 'broll_01', title: "Denys Viet在泳池边",
      caption: "用于熟悉项目视觉呈现的垂直片段。该视频并不认可学生的表现或完成工作任务的速度。",
      videoSrc: 'assets/videos/broll_01_dennis_pool_29s.mp4',
      posterSrc: 'assets/videos/broll_01_dennis_pool_29s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:29', durationSeconds: 28.6
    },
    {
      id: 'broll_02', title: "Tatiana Colibri·阳台",
      caption: "Tatiana Colibri 的垂直片段，用于该项目的街区。该剪辑是视觉演示，而不是收入或客户结果的证明。",
      videoSrc: 'assets/videos/broll_02_tatiana_balcony_10s.mp4',
      posterSrc: 'assets/videos/broll_02_tatiana_balcony_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_03', title: "Denys Viet · 厨房",
      caption: "该项目家庭系列的一个简短的垂直片段。它可以用作中断，但不能被冒充为经过验证的自动化的记录。",
      videoSrc: 'assets/videos/broll_03_dennis_kitchen_10s.mp4',
      posterSrc: 'assets/videos/broll_03_dennis_kitchen_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_04', title: "Tatiana Colibri·家庭框架",
      caption: "家庭系列中 Tatiana Colibri 的垂直短片段。它补充了有关该项目的故事，但没有承诺收益或未经证实的绩效指标。",
      videoSrc: 'assets/videos/broll_04_tatiana_sofa_10s.mp4',
      posterSrc: 'assets/videos/broll_04_tatiana_sofa_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_05', title: "直播轮播·首选",
      caption: "动画片段显示了轮播提要选项之一。这是一个示例格式，并非对承保范围、应用程序或支付途径操作的认可。",
      videoSrc: 'assets/videos/broll_05_living_carousel_s1.mp4',
      posterSrc: 'assets/videos/broll_05_living_carousel_s1.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_06', title: "直播轮播·第二种选择",
      caption: "第二个动画片段有助于比较轮播提要选项。大小以完成后的文件为准，本例未衡量提升效果。",
      videoSrc: 'assets/videos/broll_06_living_carousel_s2.mp4',
      posterSrc: 'assets/videos/broll_06_living_carousel_s2.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_07', title: "Denys Viet·家居系列",
      caption: "用于网站各部分之间过渡的另一个垂直片段。它不是客户反馈，也不能取代对所示工作流程的审查。",
      videoSrc: 'assets/videos/broll_07_dennis_bedroom_10s.mp4',
      posterSrc: 'assets/videos/broll_07_dennis_bedroom_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_08', title: "Denys Viet·帧过渡",
      caption: "垂直片段完成了该项目的视觉中断的家庭系列。该剪辑补充了故事导航，但没有提供时间或金钱节省的证明。",
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
    brandName: "Tatiana Colibri 和Denys Viet",
    title: "针对五个角色的 20 次培训课程",
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
