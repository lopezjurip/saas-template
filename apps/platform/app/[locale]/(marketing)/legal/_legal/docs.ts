export type LegalLocale = "es" | "en" | "pt";
export type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";

export type LegalNavItem = { id: LegalSection; label: string; path: string };

export type LegalDoc = {
  title: string;
  summary: string;
  updated: string;
  sections: { id: string; title: string; body: string[] }[];
};

export type LegalCopy = {
  rootTag: string;
  sidebarTitle: string;
  lastUpdated: string;
  summaryTitle: string;
  tocTitle: string;
  feedback: string;
  download: string;
};

export const LEGAL_NAV = {
  es: [
    { id: "terms", label: "Términos del servicio", path: "/legal/terms" },
    { id: "privacy", label: "Privacidad", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Seguridad", path: "/legal/security" },
  ],
  en: [
    { id: "terms", label: "Terms of Service", path: "/legal/terms" },
    { id: "privacy", label: "Privacy", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Security", path: "/legal/security" },
  ],
  pt: [
    { id: "terms", label: "Termos de Serviço", path: "/legal/terms" },
    { id: "privacy", label: "Privacidade", path: "/legal/privacy" },
    { id: "cookies", label: "Cookies", path: "/legal/cookies" },
    { id: "dpa", label: "DPA", path: "/legal/dpa" },
    { id: "security", label: "Segurança", path: "/legal/security" },
  ],
} satisfies Record<LegalLocale, LegalNavItem[]>;

export const LEGAL_COPY = {
  es: {
    rootTag: "Legal",
    sidebarTitle: "Documentos",
    lastUpdated: "Última actualización",
    summaryTitle: "En una frase",
    tocTitle: "En esta página",
    feedback: "¿Encontraste algo poco claro? Escríbenos a legal@humane.cl.",
    download: "Descargar PDF",
  },
  en: {
    rootTag: "Legal",
    sidebarTitle: "Documents",
    lastUpdated: "Last updated",
    summaryTitle: "In one line",
    tocTitle: "On this page",
    feedback: "Found something unclear? Write us at legal@humane.cl.",
    download: "Download PDF",
  },
  pt: {
    rootTag: "Legal",
    sidebarTitle: "Documentos",
    lastUpdated: "Última atualização",
    summaryTitle: "Em uma frase",
    tocTitle: "Nesta página",
    feedback: "Achou algo confuso? Escreva pra legal@humane.cl.",
    download: "Baixar PDF",
  },
} satisfies Record<LegalLocale, LegalCopy>;

export const LEGAL_DOCS = {
  es: {
    terms: {
      title: "Términos del servicio",
      summary:
        "Usa Humane con criterio, paga lo que corresponde y no rompas la plataforma a propósito. Lo demás es la versión larga de este texto de ejemplo.",
      updated: "12 de mayo, 2026",
      sections: [
        {
          id: "intro",
          title: "1. Introducción",
          body: [
            'Estos Términos del Servicio (los "Términos") regulan tu acceso y uso de la plataforma Humane, incluyendo el sitio web, las APIs y cualquier servicio relacionado. Texto de ejemplo, no constituye asesoría legal.',
            "Al crear una cuenta, integrarte a una organización o utilizar el Servicio aceptas estos Términos de muestra. Si los aceptas en nombre de una empresa, declaras tener autoridad para hacerlo.",
          ],
        },
        {
          id: "account",
          title: "2. Cuenta y acceso",
          body: [
            "Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada bajo tu cuenta. Avísanos en cuanto detectes un uso no autorizado.",
            "Humane puede suspender el acceso si detecta un uso que ponga en riesgo la integridad del Servicio o el cumplimiento normativo. Contenido de muestra.",
          ],
        },
        {
          id: "use",
          title: "3. Uso aceptable",
          body: [
            "No puedes usar Humane para infringir leyes, vulnerar derechos de terceros, distribuir malware o realizar ingeniería inversa fuera de lo permitido por la ley aplicable.",
            "No puedes entrenar modelos competidores con outputs del Servicio sin autorización expresa y por escrito. Texto provisorio.",
          ],
        },
        {
          id: "fees",
          title: "4. Tarifas y facturación",
          body: [
            "Las tarifas vigentes están publicadas en la página de precios. Los cargos se renuevan automáticamente al fin de cada período hasta que canceles.",
            "Los planes anuales se facturan por adelantado. Los reembolsos se gestionan según la sección de duración y terminación.",
          ],
        },
        {
          id: "data",
          title: "5. Tus datos",
          body: [
            "Conservas la propiedad de tu contenido. Nos otorgas la licencia mínima necesaria para operar el Servicio, lo que incluye almacenarlo, procesarlo y transmitirlo a los proveedores que hayas habilitado.",
            "No usamos tu contenido para entrenar modelos compartidos. Para los detalles operativos, consulta el DPA. Contenido de ejemplo.",
          ],
        },
        {
          id: "ip",
          title: "6. Propiedad intelectual",
          body: [
            "Humane retiene todos los derechos sobre el Servicio, la marca y los componentes propios. Las partes del software ofrecidas como open source se rigen por sus licencias específicas.",
          ],
        },
        {
          id: "term",
          title: "7. Duración y terminación",
          body: [
            "Puedes cancelar cuando quieras desde la consola. Los planes mensuales se cancelan con efecto inmediato; los anuales mantienen acceso hasta el fin del período pagado.",
            "Si suspendemos tu cuenta sin causa razonable, te reembolsamos prorrateado el tiempo no usado. Texto de muestra.",
          ],
        },
        {
          id: "liability",
          title: "8. Responsabilidad",
          body: [
            "En la máxima medida permitida por la ley, la responsabilidad agregada de Humane está limitada a lo que hayas pagado en los 12 meses previos al evento. Cláusula de ejemplo.",
          ],
        },
        {
          id: "law",
          title: "9. Ley aplicable",
          body: [
            "Estos Términos se rigen por las leyes de la República de Chile. Las disputas se resolverán en los tribunales competentes de Santiago. Texto provisorio.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacidad",
      summary:
        "Procesamos lo mínimo necesario para que el Servicio funcione, no vendemos datos y respetamos tus derechos bajo la Ley 21.719. Texto de ejemplo.",
      updated: "12 de mayo, 2026",
      sections: [
        {
          id: "who",
          title: "1. Quiénes somos",
          body: [
            "Humane SpA, con domicilio comercial en Santiago de Chile, es el responsable del tratamiento. Contenido de muestra.",
          ],
        },
        {
          id: "what",
          title: "2. Datos que tratamos",
          body: [
            "Datos de cuenta: nombre, correo, teléfono y organización a la que perteneces.",
            "Datos de uso: eventos técnicos para operar, asegurar y mejorar el Servicio.",
            "Contenido: los mensajes, documentos y artefactos que envías al Servicio.",
          ],
        },
        {
          id: "why",
          title: "3. Bases legales y finalidades",
          body: [
            "Ejecución del contrato (operar el Servicio), interés legítimo (seguridad y mejora) y consentimiento explícito para comunicaciones de marketing. Texto de ejemplo.",
          ],
        },
        {
          id: "share",
          title: "4. Cómo lo compartimos",
          body: [
            "Con los proveedores que hayas habilitado, con sub-procesadores listados públicamente y con autoridades cuando exista obligación legal válida.",
          ],
        },
        {
          id: "rights",
          title: "5. Tus derechos",
          body: [
            "Acceso, rectificación, supresión, portabilidad, oposición y limitación. Puedes ejercerlos desde tu cuenta o escribiendo a privacy@humane.cl.",
          ],
        },
        {
          id: "retain",
          title: "6. Retención",
          body: [
            "Conservamos los datos mientras tu cuenta esté activa y por el plazo legal mínimo después de eliminarla.",
          ],
        },
        {
          id: "intl",
          title: "7. Transferencias internacionales",
          body: [
            "Cuando transferimos datos fuera de tu región usamos cláusulas contractuales tipo y mecanismos de adecuación reconocidos.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      summary:
        "Usamos cookies para mantener tu sesión, recordar tus preferencias y entender qué partes del Servicio te ayudan. Puedes apagarlas a discreción. Texto de ejemplo.",
      updated: "12 de mayo, 2026",
      sections: [
        {
          id: "what",
          title: "1. Qué son",
          body: [
            "Pequeños archivos guardados por tu navegador que permiten recordar información entre páginas y sesiones.",
          ],
        },
        {
          id: "kinds",
          title: "2. Tipos que usamos",
          body: [
            "Esenciales: sesión, autenticación, anti-fraude. No se pueden desactivar.",
            "Preferencias: idioma, tema, vistas guardadas.",
            "Analítica: para entender cómo se usa el Servicio sin identificarte personalmente.",
          ],
        },
        {
          id: "control",
          title: "3. Cómo controlarlas",
          body: [
            "Desde el banner que aparece la primera vez, desde Cuenta → Privacidad o directamente en tu navegador.",
          ],
        },
      ],
    },
    dpa: {
      title: "Acuerdo de procesamiento de datos (DPA)",
      summary:
        "Tú eres el responsable, nosotros somos el encargado. Esto vive como anexo al contrato principal y aplica si tratas datos personales con el Servicio. Texto de ejemplo.",
      updated: "12 de mayo, 2026",
      sections: [
        {
          id: "roles",
          title: "1. Roles",
          body: [
            "El cliente actúa como responsable del tratamiento y Humane como encargado, exclusivamente para prestar el Servicio.",
          ],
        },
        {
          id: "instr",
          title: "2. Instrucciones",
          body: [
            "Humane trata datos personales únicamente conforme a tus instrucciones documentadas, incluidos los ajustes de tu cuenta.",
          ],
        },
        {
          id: "sec",
          title: "3. Medidas de seguridad",
          body: [
            "Las descritas en el anexo de seguridad: cifrado en tránsito y reposo, MFA, segregación de redes, gestión de vulnerabilidades y respuesta a incidentes.",
          ],
        },
        {
          id: "sub",
          title: "4. Sub-encargados",
          body: [
            "La lista vigente se publica en la página de sub-encargados. Te avisamos con al menos 30 días de antelación antes de incorporar uno nuevo.",
          ],
        },
        {
          id: "return",
          title: "5. Devolución y borrado",
          body: [
            "Al terminar el contrato exportamos o eliminamos los datos personales en un plazo máximo de 30 días, salvo obligación legal de conservar.",
          ],
        },
      ],
    },
    security: {
      title: "Seguridad",
      summary:
        "Tratamos la seguridad como un producto: certificaciones vigentes, cifrado por defecto, MFA obligatorio y respuesta a incidentes 24/7. Texto de ejemplo.",
      updated: "12 de mayo, 2026",
      sections: [
        {
          id: "compliance",
          title: "1. Cumplimiento",
          body: ["SOC 2 Type II, ISO 27001:2022 e informe anual de pentest disponible bajo NDA. Contenido de muestra."],
        },
        {
          id: "crypto",
          title: "2. Criptografía",
          body: ["TLS 1.2+ en tránsito, AES-256 en reposo, gestión de claves con rotación trimestral."],
        },
        {
          id: "ops",
          title: "3. Operación",
          body: [
            "Despliegues con revisión obligatoria, separación de entornos, registros centralizados con retención mínima de 12 meses.",
          ],
        },
        {
          id: "ir",
          title: "4. Respuesta a incidentes",
          body: ["Notificación al cliente afectado en menos de 72 horas con un primer informe y plan de mitigación."],
        },
        {
          id: "disc",
          title: "5. Divulgación responsable",
          body: [
            "Escríbenos a security@humane.cl. Reconocimiento público en nuestro programa de recompensas para hallazgos elegibles.",
          ],
        },
      ],
    },
  },
  en: {
    terms: {
      title: "Terms of Service",
      summary:
        "Use Humane thoughtfully, pay what's owed, and don't break the platform on purpose. Everything below is the long version of this sample text.",
      updated: "May 12, 2026",
      sections: [
        {
          id: "intro",
          title: "1. Introduction",
          body: [
            'These Terms of Service (the "Terms") govern your access to and use of the Humane platform, including the website, APIs and any related service. Sample text, not legal advice.',
            "By creating an account, joining an organization or using the Service you accept these sample Terms. If you accept on behalf of a company, you represent you have the authority to do so.",
          ],
        },
        {
          id: "account",
          title: "2. Account and access",
          body: [
            "You are responsible for keeping your credentials confidential and for any activity carried out under your account. Tell us as soon as you detect unauthorized use.",
            "Humane may suspend access if it detects usage that endangers the integrity of the Service or regulatory compliance. Placeholder content.",
          ],
        },
        {
          id: "use",
          title: "3. Acceptable use",
          body: [
            "You may not use Humane to break laws, violate third-party rights, distribute malware or reverse-engineer beyond what applicable law allows.",
            "You may not train competing models with the Service's outputs without express written permission. Provisional text.",
          ],
        },
        {
          id: "fees",
          title: "4. Fees and billing",
          body: [
            "The current fees are published on the pricing page. Charges renew automatically at the end of each period until you cancel.",
            "Annual plans are billed upfront. Refunds are handled per the term and termination section.",
          ],
        },
        {
          id: "data",
          title: "5. Your data",
          body: [
            "You retain ownership of your content. You grant us the minimum license needed to operate the Service, which includes storing, processing and transmitting it to providers you have enabled.",
            "We don't use your content to train shared models. See the DPA for operational detail. Sample content.",
          ],
        },
        {
          id: "ip",
          title: "6. Intellectual property",
          body: [
            "Humane retains all rights to the Service, the brand and proprietary components. Parts of the software offered as open source are governed by their specific licenses.",
          ],
        },
        {
          id: "term",
          title: "7. Term and termination",
          body: [
            "You can cancel at any time from the console. Monthly plans cancel immediately; annual plans retain access through the paid-for period.",
            "If we suspend your account without reasonable cause, we prorate-refund the unused time. Sample text.",
          ],
        },
        {
          id: "liability",
          title: "8. Liability",
          body: [
            "To the maximum extent permitted by law, Humane's aggregate liability is limited to what you paid in the 12 months preceding the event. Sample clause.",
          ],
        },
        {
          id: "law",
          title: "9. Governing law",
          body: [
            "These Terms are governed by the laws of the Republic of Chile. Disputes will be resolved by the competent courts of Santiago. Provisional text.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy",
      summary:
        "We process the minimum needed for the Service to work, we don't sell data, and we respect your rights under Law 21.719. Sample text.",
      updated: "May 12, 2026",
      sections: [
        {
          id: "who",
          title: "1. Who we are",
          body: [
            "Humane SpA, with commercial address in Santiago, Chile, is the data controller. Placeholder content.",
          ],
        },
        {
          id: "what",
          title: "2. Data we process",
          body: [
            "Account data: name, email, phone, organization you belong to.",
            "Usage data: technical events to operate, secure and improve the Service.",
            "Content: messages, documents and artifacts you send to the Service.",
          ],
        },
        {
          id: "why",
          title: "3. Legal bases and purposes",
          body: [
            "Contract performance (operating the Service), legitimate interest (security and improvement) and explicit consent for marketing communications. Sample text.",
          ],
        },
        {
          id: "share",
          title: "4. How we share",
          body: [
            "With providers you have enabled, with publicly listed sub-processors, and with authorities when there's a valid legal obligation.",
          ],
        },
        {
          id: "rights",
          title: "5. Your rights",
          body: [
            "Access, rectification, erasure, portability, objection and restriction. You can exercise them from your account or by writing to privacy@humane.cl.",
          ],
        },
        {
          id: "retain",
          title: "6. Retention",
          body: ["We retain data while your account is active and for the minimum legal period after deletion."],
        },
        {
          id: "intl",
          title: "7. International transfers",
          body: [
            "When we transfer data outside your region we use standard contractual clauses and recognized adequacy mechanisms.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      summary:
        "We use cookies to keep you signed in, remember your preferences, and understand which parts of the Service help you. You can turn them off at will. Sample text.",
      updated: "May 12, 2026",
      sections: [
        {
          id: "what",
          title: "1. What they are",
          body: ["Small files saved by your browser that let us remember information across pages and sessions."],
        },
        {
          id: "kinds",
          title: "2. Types we use",
          body: [
            "Essential: session, auth, anti-fraud. Cannot be turned off.",
            "Preferences: language, theme, saved views.",
            "Analytics: to understand how the Service is used without identifying you personally.",
          ],
        },
        {
          id: "control",
          title: "3. How to control them",
          body: ["From the banner shown on first visit, from Account → Privacy, or directly in your browser."],
        },
      ],
    },
    dpa: {
      title: "Data Processing Agreement",
      summary:
        "You are the controller, we are the processor. This lives as an annex to the main contract and applies if you process personal data with the Service. Sample text.",
      updated: "May 12, 2026",
      sections: [
        {
          id: "roles",
          title: "1. Roles",
          body: ["The customer acts as the controller and Humane as processor, exclusively to provide the Service."],
        },
        {
          id: "instr",
          title: "2. Instructions",
          body: [
            "Humane processes personal data only per your documented instructions, including the settings in your account.",
          ],
        },
        {
          id: "sec",
          title: "3. Security measures",
          body: [
            "Those described in the security annex: encryption in transit and at rest, MFA, network segregation, vulnerability management and incident response.",
          ],
        },
        {
          id: "sub",
          title: "4. Sub-processors",
          body: [
            "The current list is published on the sub-processors page. We notify you at least 30 days before adding a new one.",
          ],
        },
        {
          id: "return",
          title: "5. Return and deletion",
          body: [
            "On contract termination we export or delete personal data within at most 30 days, unless legally required to keep it.",
          ],
        },
      ],
    },
    security: {
      title: "Security",
      summary:
        "We treat security as a product: active certifications, encryption by default, mandatory MFA, and 24/7 incident response. Sample text.",
      updated: "May 12, 2026",
      sections: [
        {
          id: "compliance",
          title: "1. Compliance",
          body: [
            "SOC 2 Type II, ISO 27001:2022 and an annual pentest report available under NDA. Placeholder content.",
          ],
        },
        {
          id: "crypto",
          title: "2. Cryptography",
          body: ["TLS 1.2+ in transit, AES-256 at rest, key management with quarterly rotation."],
        },
        {
          id: "ops",
          title: "3. Operations",
          body: [
            "Mandatory review on deploys, environment separation, centralized logs with minimum 12-month retention.",
          ],
        },
        {
          id: "ir",
          title: "4. Incident response",
          body: [
            "Notification to the affected customer in less than 72 hours, with a first report and mitigation plan.",
          ],
        },
        {
          id: "disc",
          title: "5. Responsible disclosure",
          body: ["Write to security@humane.cl. Public recognition in our bounty program for eligible findings."],
        },
      ],
    },
  },
  pt: {
    terms: {
      title: "Termos de Serviço",
      summary:
        "Use a Humane com cabeça, pague o que deve e não quebre a plataforma de propósito. O resto é a versão longa deste texto de exemplo.",
      updated: "12 de maio, 2026",
      sections: [
        {
          id: "intro",
          title: "1. Introdução",
          body: [
            'Estes Termos de Serviço (os "Termos") regem seu acesso e uso da plataforma Humane, incluindo o site, as APIs e qualquer serviço relacionado. Texto de exemplo, não é aconselhamento jurídico.',
            "Ao criar uma conta, entrar em uma organização ou utilizar o Serviço, você aceita estes Termos de amostra. Se você aceita em nome de uma empresa, declara ter autoridade para isso.",
          ],
        },
        {
          id: "account",
          title: "2. Conta e acesso",
          body: [
            "Você é responsável por manter suas credenciais confidenciais e por qualquer atividade realizada sob sua conta. Avise assim que detectar uso não autorizado.",
            "A Humane pode suspender o acesso se detectar uso que coloque em risco a integridade do Serviço ou o compliance. Conteúdo de amostra.",
          ],
        },
        {
          id: "use",
          title: "3. Uso aceitável",
          body: [
            "Você não pode usar a Humane para infringir leis, violar direitos de terceiros, distribuir malware ou fazer engenharia reversa além do que a lei aplicável permite.",
            "Você não pode treinar modelos concorrentes com outputs do Serviço sem autorização expressa por escrito. Texto provisório.",
          ],
        },
        {
          id: "fees",
          title: "4. Tarifas e cobrança",
          body: [
            "As tarifas vigentes estão na página de preços. As cobranças renovam automaticamente ao fim de cada período até você cancelar.",
            "Planos anuais são cobrados antecipadamente. Reembolsos seguem a seção de vigência e rescisão.",
          ],
        },
        {
          id: "data",
          title: "5. Seus dados",
          body: [
            "Você mantém a propriedade do seu conteúdo. Você nos concede a licença mínima necessária para operar o Serviço, o que inclui armazenar, processar e transmitir aos provedores que você habilitou.",
            "Não usamos seu conteúdo para treinar modelos compartilhados. Detalhes operacionais no DPA. Conteúdo de exemplo.",
          ],
        },
        {
          id: "ip",
          title: "6. Propriedade intelectual",
          body: [
            "A Humane retém todos os direitos sobre o Serviço, a marca e os componentes próprios. As partes do software oferecidas em open source seguem suas licenças específicas.",
          ],
        },
        {
          id: "term",
          title: "7. Vigência e rescisão",
          body: [
            "Você pode cancelar a qualquer momento pelo console. Planos mensais cancelam com efeito imediato; planos anuais mantêm o acesso até o fim do período pago.",
            "Se suspendermos sua conta sem causa razoável, devolvemos pro-rata o tempo não usado. Texto de amostra.",
          ],
        },
        {
          id: "liability",
          title: "8. Responsabilidade",
          body: [
            "Na máxima medida permitida pela lei, a responsabilidade agregada da Humane está limitada ao valor pago nos 12 meses anteriores ao evento. Cláusula de exemplo.",
          ],
        },
        {
          id: "law",
          title: "9. Lei aplicável",
          body: [
            "Estes Termos são regidos pela lei da República do Chile. Disputas serão resolvidas no foro competente de Santiago. Texto provisório.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacidade",
      summary:
        "Processamos o mínimo necessário para o Serviço funcionar, não vendemos dados e respeitamos seus direitos sob a Lei 21.719. Texto de exemplo.",
      updated: "12 de maio, 2026",
      sections: [
        {
          id: "who",
          title: "1. Quem somos",
          body: ["A Humane SpA, com sede em Santiago, Chile, é a controladora dos dados. Conteúdo de amostra."],
        },
        {
          id: "what",
          title: "2. Dados que tratamos",
          body: [
            "Dados de conta: nome, email, telefone e organização.",
            "Dados de uso: eventos técnicos para operar, garantir e melhorar o Serviço.",
            "Conteúdo: mensagens, documentos e artefatos que você envia ao Serviço.",
          ],
        },
        {
          id: "why",
          title: "3. Bases legais e finalidades",
          body: [
            "Execução do contrato, interesse legítimo (segurança e melhoria) e consentimento explícito para comunicações de marketing. Texto de exemplo.",
          ],
        },
        {
          id: "share",
          title: "4. Como compartilhamos",
          body: [
            "Com provedores habilitados por você, sub-processadores listados publicamente e autoridades quando houver obrigação legal válida.",
          ],
        },
        {
          id: "rights",
          title: "5. Seus direitos",
          body: [
            "Acesso, retificação, exclusão, portabilidade, oposição e limitação. Exerça pela conta ou por privacy@humane.cl.",
          ],
        },
        {
          id: "retain",
          title: "6. Retenção",
          body: ["Mantemos dados enquanto sua conta estiver ativa e pelo prazo legal mínimo depois de deletada."],
        },
        {
          id: "intl",
          title: "7. Transferências internacionais",
          body: [
            "Quando transferimos dados para fora da sua região usamos cláusulas contratuais padrão e mecanismos de adequação reconhecidos.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      summary:
        "Usamos cookies para manter sua sessão, lembrar preferências e entender quais partes do Serviço ajudam você. Pode desligar à vontade. Texto de exemplo.",
      updated: "12 de maio, 2026",
      sections: [
        {
          id: "what",
          title: "1. O que são",
          body: ["Arquivos pequenos guardados pelo seu navegador para lembrar informações entre páginas e sessões."],
        },
        {
          id: "kinds",
          title: "2. Tipos que usamos",
          body: [
            "Essenciais: sessão, autenticação, antifraude. Não podem ser desligadas.",
            "Preferências: idioma, tema, views salvas.",
            "Analytics: para entender o uso do Serviço sem identificar você pessoalmente.",
          ],
        },
        {
          id: "control",
          title: "3. Como controlar",
          body: ["Pelo banner na primeira visita, em Conta → Privacidade ou direto no navegador."],
        },
      ],
    },
    dpa: {
      title: "Acordo de Processamento de Dados (DPA)",
      summary:
        "Você é o controlador, nós somos o processador. Funciona como anexo ao contrato principal e se aplica se você trata dados pessoais com o Serviço. Texto de exemplo.",
      updated: "12 de maio, 2026",
      sections: [
        {
          id: "roles",
          title: "1. Papéis",
          body: [
            "O cliente atua como controlador e a Humane como processadora, exclusivamente para prestar o Serviço.",
          ],
        },
        {
          id: "instr",
          title: "2. Instruções",
          body: [
            "A Humane processa dados pessoais apenas conforme suas instruções documentadas, incluindo as configurações da sua conta.",
          ],
        },
        {
          id: "sec",
          title: "3. Medidas de segurança",
          body: [
            "Aquelas descritas no anexo de segurança: criptografia em trânsito e em repouso, MFA, segregação de redes, gestão de vulnerabilidades e resposta a incidentes.",
          ],
        },
        {
          id: "sub",
          title: "4. Sub-processadores",
          body: [
            "A lista vigente é publicada na página de sub-processadores. Avisamos com pelo menos 30 dias antes de incorporar um novo.",
          ],
        },
        {
          id: "return",
          title: "5. Devolução e exclusão",
          body: [
            "Ao terminar o contrato exportamos ou eliminamos os dados pessoais em até 30 dias, salvo obrigação legal de manter.",
          ],
        },
      ],
    },
    security: {
      title: "Segurança",
      summary:
        "Tratamos segurança como produto: certificações ativas, criptografia por padrão, MFA obrigatório e resposta a incidentes 24/7. Texto de exemplo.",
      updated: "12 de maio, 2026",
      sections: [
        {
          id: "compliance",
          title: "1. Compliance",
          body: ["SOC 2 Type II, ISO 27001:2022 e relatório anual de pentest disponível sob NDA. Conteúdo de amostra."],
        },
        {
          id: "crypto",
          title: "2. Criptografia",
          body: ["TLS 1.2+ em trânsito, AES-256 em repouso, gestão de chaves com rotação trimestral."],
        },
        {
          id: "ops",
          title: "3. Operação",
          body: [
            "Deploys com revisão obrigatória, separação de ambientes, logs centralizados com retenção mínima de 12 meses.",
          ],
        },
        {
          id: "ir",
          title: "4. Resposta a incidentes",
          body: ["Notificação ao cliente afetado em menos de 72 horas, com primeiro relatório e plano de mitigação."],
        },
        {
          id: "disc",
          title: "5. Divulgação responsável",
          body: [
            "Escreva para security@humane.cl. Reconhecimento público no nosso programa de bounty para descobertas elegíveis.",
          ],
        },
      ],
    },
  },
} satisfies Record<LegalLocale, Record<LegalSection, LegalDoc>>;

export function LEGAL_LOCALE(locale: string): LegalLocale {
  if (locale === "en" || locale === "pt") return locale;
  return "es";
}
