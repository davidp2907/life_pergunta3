import React, { useState, useEffect, useRef } from 'react';

interface FormData {
  formId: string;
  respostaId: string;
  startTime: string;
  endTime: string;
  completionTimeSeconds: number;
  dataAplicacao: string;
  fullName: string;
  email: string;
  naturalidade: string;
  cpf: string;
  birthDate: string;
  objetivo: string;
  aplicador: string;
  nomeAplicador: string;
  escolhaAtividade: string;
  fractalComportamento: string;
  respostas: Array<{
    resposta: string;
    importancia: string;
    justificativa: string;
  }>;
  feedbackFinal: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    formId: "pergunta3", // Will be set in useEffect
    respostaId: '',
    startTime: '',
    endTime: '',
    completionTimeSeconds: 0,
    dataAplicacao: '',
    fullName: '',
    email: '',
    naturalidade: '',
    cpf: '',
    birthDate: '',
    objetivo: '',
    aplicador: '',
    nomeAplicador: '',
    escolhaAtividade: '',
    fractalComportamento: '',
    respostas: [
      { resposta: '', importancia: '', justificativa: '' },
      { resposta: '', importancia: '', justificativa: '' },
      { resposta: '', importancia: '', justificativa: '' },
    ],
    feedbackFinal: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [usedImportancias, setUsedImportancias] = useState<Set<string>>(new Set());
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = new Date();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
    setFormData(prev => ({
      ...prev,
      respostaId: uniqueId, // ID único da submissão
      startTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataAplicacao: now.toLocaleDateString('pt-BR')
    }));
  }, []);
  

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;

    let sum = 0;
    let rest;

    if (cleanCPF === "00000000000") return false;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;
      
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
  };

  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
  };

  const handleImportanciaChange = (index: number, value: string) => {
    const newRespostas = [...formData.respostas];
    const oldValue = newRespostas[index].importancia;

    if (oldValue) {
      const newUsed = new Set(usedImportancias);
      newUsed.delete(oldValue);
      setUsedImportancias(newUsed);
    }

    if (value) {
      const newUsed = new Set(usedImportancias);
      newUsed.add(value);
      setUsedImportancias(newUsed);
    }

    newRespostas[index].importancia = value;
    setFormData({ ...formData, respostas: newRespostas });
  };

  const getAvailableImportancias = (currentValue: string) => {
    const options = ['3', '2', '1'];
    return options.filter(opt => !usedImportancias.has(opt) || opt === currentValue);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Digite o nome completo com pelo menos duas palavras';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validate naturalidade
    if (!formData.naturalidade.trim()) {
      newErrors.naturalidade = 'Naturalidade é obrigatória';
    }

    // Validate CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    // Validate birth date
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }

    // Validate objetivo
    if (!formData.objetivo.trim()) {
      newErrors.objetivo = 'Objetivo é obrigatório';
    }

    // Validate aplicador
    if (!formData.aplicador) {
      newErrors.aplicador = 'Selecione o tipo de aplicação';
    }

    // Validate nome do aplicador when aplicador is "assistida"
    if (formData.aplicador === 'assistida' && !formData.nomeAplicador.trim()) {
      newErrors.nomeAplicador = 'Nome do aplicador é obrigatório';
    }

    // Validate escolha da atividade
    if (!formData.escolhaAtividade) {
      newErrors.escolhaAtividade = 'Escolha da atividade é obrigatória';
    }

    // Validate respostas
    formData.respostas.forEach((resposta, index) => {
      if (!resposta.resposta.trim()) {
        newErrors[`resposta${index}`] = 'Resposta é obrigatória';
      }
      if (!resposta.importancia) {
        newErrors[`importancia${index}`] = 'Hierarquia é obrigatória';
      }
      if (!resposta.justificativa.trim()) {
        newErrors[`justificativa${index}`] = 'Justificativa é obrigatória';
      }
    });

    // Validate feedback final
    if (!formData.feedbackFinal.trim()) {
      newErrors.feedbackFinal = 'Feedback final é obrigatório';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    const newErrors = validateForm();
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      // Calculate completion time
      const endTime = Date.now();
      const completionTimeSeconds = Math.floor((endTime - startTimeRef.current) / 1000 / 60);

      
      const finalFormData = {
        ...formData,
        endTime: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        completionTimeSeconds
      };

      try {
        await fetch("https://script.google.com/macros/s/AKfycbwg91VHM12inVLopz5OgLk16iCHvL7739XUA6GTbFiVExYk4pjV0UBLhUePKXFfJhw/exec", {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalFormData)
        });

        alert("Formulário enviado com sucesso!");
        window.location.href = "https://www.lifenergy.com.br/";
      } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar os dados.");
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateForm();
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold text-center text-teal-700 mb-8">Lifenergy</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hora Inicial */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <label className="block text-teal-700 font-medium mb-2">
                Hora Inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                disabled
                className="p-2 border rounded-lg bg-gray-100 w-32"
              />
            </div>
          </div>

          {/* Seção IDENTIDADE */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">IDENTIDADE</h2>

            <div className="space-y-6">
              {/* Nome Completo */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  className={`w-full p-2 border rounded-lg ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: capitalizeWords(e.target.value) });
                    if (touched.fullName) {
                      handleBlur('fullName');
                    }
                  }}
                  onBlur={() => handleBlur('fullName')}
                />
                {errors.fullName && touched.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`w-full p-2 border rounded-lg ${errors.email && touched.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (touched.email) {
                      handleBlur('email');
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Naturalidade */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Naturalidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="naturalidade"
                  className={`w-full p-2 border rounded-lg ${errors.naturalidade && touched.naturalidade ? 'border-red-500' : ''}`}
                  value={formData.naturalidade}
                  onChange={(e) => {
                    setFormData({ ...formData, naturalidade: e.target.value });
                    if (touched.naturalidade) {
                      handleBlur('naturalidade');
                    }
                  }}
                  onBlur={() => handleBlur('naturalidade')}
                />
                {errors.naturalidade && touched.naturalidade && (
                  <p className="text-red-500 text-sm mt-1">{errors.naturalidade}</p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  className={`w-full p-2 border rounded-lg ${errors.cpf && touched.cpf ? 'border-red-500' : ''}`}
                  value={formData.cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      setFormData({ ...formData, cpf: formatCPF(value) });
                      if (touched.cpf) {
                        handleBlur('cpf');
                      }
                    }
                  }}
                  onBlur={() => handleBlur('cpf')}
                  maxLength={14}
                />
                {errors.cpf && touched.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
                )}
              </div>

              {/* Data de nascimento */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  className={`w-full p-2 border rounded-lg ${errors.birthDate && touched.birthDate ? 'border-red-500' : ''}`}
                  value={formData.birthDate}
                  onChange={(e) => {
                    setFormData({ ...formData, birthDate: e.target.value });
                    if (touched.birthDate) {
                      handleBlur('birthDate');
                    }
                  }}
                  onBlur={() => handleBlur('birthDate')}
                />
                {errors.birthDate && touched.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                )}
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Qual é o seu objetivo de participar deste programa? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="objetivo"
                  className={`w-full p-2 border rounded-lg h-32 ${errors.objetivo && touched.objetivo ? 'border-red-500' : ''}`}
                  value={formData.objetivo}
                  onChange={(e) => {
                    setFormData({ ...formData, objetivo: e.target.value });
                    if (touched.objetivo) {
                      handleBlur('objetivo');
                    }
                  }}
                  onBlur={() => handleBlur('objetivo')}
                />
                {errors.objetivo && touched.objetivo && (
                  <p className="text-red-500 text-sm mt-1">{errors.objetivo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção REGISTRO DE APLICAÇÃO */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">REGISTRO DE APLICAÇÃO</h2>

            <div className="space-y-6">
              {/* Nome do Aplicador */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Nome do Aplicador <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <select
                    name="aplicador"
                    className={`w-full p-2 border rounded-lg ${errors.aplicador && touched.aplicador ? 'border-red-500' : ''}`}
                    value={formData.aplicador}
                    onChange={(e) => {
                      setFormData({ ...formData, aplicador: e.target.value });
                      if (touched.aplicador) {
                        handleBlur('aplicador');
                      }
                    }}
                    onBlur={() => handleBlur('aplicador')}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="auto">Auto Aplicação</option>
                    <option value="assistida">Aplicação Assistida</option>
                  </select>
                  {formData.aplicador === 'assistida' && (
                    <input
                      type="text"
                      name="nomeAplicador"
                      placeholder="Nome do Aplicador"
                      className={`w-full p-2 border rounded-lg ${errors.nomeAplicador && touched.nomeAplicador ? 'border-red-500' : ''}`}
                      value={formData.nomeAplicador}
                      onChange={(e) => {
                        setFormData({ ...formData, nomeAplicador: e.target.value });
                        if (touched.nomeAplicador) {
                          handleBlur('nomeAplicador');
                        }
                      }}
                      onBlur={() => handleBlur('nomeAplicador')}
                    />
                  )}
                </div>
                {errors.aplicador && touched.aplicador && (
                  <p className="text-red-500 text-sm mt-1">{errors.aplicador}</p>
                )}
                {errors.nomeAplicador && touched.nomeAplicador && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomeAplicador}</p>
                )}
              </div>

              {/* Escolha da Atividade */}
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  Escolha Da Atividade <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="escolhaAtividade"
                      value="propria"
                      checked={formData.escolhaAtividade === 'propria'}
                      onChange={(e) => {
                        setFormData({ ...formData, escolhaAtividade: e.target.value });
                        if (touched.escolhaAtividade) {
                          handleBlur('escolhaAtividade');
                        }
                      }}
                      onBlur={() => handleBlur('escolhaAtividade')}
                      className="mr-2"
                    />
                    A Própria Pessoa
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="escolhaAtividade"
                      value="aplicador"
                      checked={formData.escolhaAtividade === 'aplicador'}
                      onChange={(e) => {
                        setFormData({ ...formData, escolhaAtividade: e.target.value });
                        if (touched.escolhaAtividade) {
                          handleBlur('escolhaAtividade');
                        }
                      }}
                      onBlur={() => handleBlur('escolhaAtividade')}
                      className="mr-2"
                    />
                    O Aplicador
                  </label>
                </div>
                {errors.escolhaAtividade && touched.escolhaAtividade && (
                  <p className="text-red-500 text-sm mt-1">{errors.escolhaAtividade}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção INSTRUÇÕES */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">INSTRUÇÕES</h2>
            <div className="space-y-6">
              <div className="bg-teal-50 p-4 rounded-lg text-teal-800 space-y-4">
                <p>ENCONTRE UM AMBIENTE TRANQUILO, LIVRE DE INTERRUPÇÕES, OU UTILIZE UM COMPUTADOR COM UMA CONEXÃO ESTÁVEL À INTERNET. VOCÊ RECEBE TAREFAS OU PADRÕES DE COMPORTAMENTO PARA DESENVOLVER.</p>
                <p>É FUNDAMENTAL QUE CADA TAREFA SEJA REALIZADA DE FORMA CONTÍNUA, SEM INTERRUPÇÕES. ELAS PODEM SER EXECUTADAS TANTO FISICAMENTE QUANTO DE MANEIRA IMAGINATIVA.</p>
                <p>RECOMENDA-SE QUE VOCÊ RESPONDA DE FORMA ESPONTÂNEA, SEM EXCESSO DE REFLEXÃO, POIS SE TRATA DE ATIVIDADES SIMPLES E ROTINEIRAS DO DIA A DIA.</p>
              </div>
            </div>
          </div>

          {/* Seção QUADRO DE REGISTRO DE DADOS */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">QUADRO DE REGISTRO DE DADOS</h2>
            <label className="block text-teal-700 font-medium mb-2">
              Fractal De Comportamento
              <p>Suponha que você joga na Mega-Sena e ganha. Cite as 3 primeiras coisas que faria com o dinheiro. Hieraquize e justifique.</p>
            </label>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-teal-50">
                    <th className="border p-2 text-left">Nº</th>
                    <th className="border p-2 text-left">(1) Respostas</th>
                    <th className="border p-2 text-left">(2) Hierarquia</th>
                    <th className="border p-2 text-left">(3) Justificativa</th>
                  </tr>
                  <tr>
                    <td className="border p-2 text-left text-sm text-gray-500"> </td>
                    <td className="border p-2 text-left text-sm text-gray-500">Nesta coluna escreva as suas respostas.</td>
                    <td className="border p-2 text-left text-sm text-gray-500">Releia as respostas da coluna (1), identifique qual a de maior importância e escreva o número 3 nesta coluna, a de média importância 2, e na outra coluna o número 1.</td>
                    <td className="border p-2 text-left text-sm text-gray-500">Justifique cada resposta da coluna (1). Escreva as suas justificativas nessa coluna no número correspondente à resposta.</td>
                  </tr>
                </thead>
                <tbody>
                  {formData.respostas.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <h3>{index + 1}</h3>
                      </td>
                      <td className="border p-2">
                        <input
                          type="text"
                          className={`w-full p-1 border rounded ${
                            errors[`resposta${index}`] && touched[`resposta${index}`] ? 'border-red-500' : ''
                          }`}
                          value={item.resposta}
                          onChange={(e) => {
                            const newRespostas = [...formData.respostas];
                            newRespostas[index].resposta = e.target.value;
                            setFormData({ ...formData, respostas: newRespostas });
                          }}
                          onBlur={() => handleBlur(`resposta${index}`)}
                        />
                        {errors[`resposta${index}`] && touched[`resposta${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`resposta${index}`]}</p>
                        )}
                      </td>
                      <td className="border p-2">
                        <select
                          className={`w-full p-1 border rounded ${
                            errors[`importancia${index}`] && touched[`importancia${index}`] ? 'border-red-500' : ''
                          }`}
                          value={item.importancia}
                          onChange={(e) => handleImportanciaChange(index, e.target.value)}
                          onBlur={() => handleBlur(`importancia${index}`)}
                        >
                          <option value="">Selecione</option>
                          <option value="Maior importância">3 - Maior importância</option>
                          <option value="Média importância">2 - Média importância</option>
                          <option value="Menor importância">1 - Menor importância</option>
                        </select>
                        {errors[`importancia${index}`] && touched[`importancia${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`importancia${index}`]}</p>
                        )}
                      </td>
                      <td className="border p-2">
                        <textarea
                          className={`w-full p-1 border rounded resize-none overflow-hidden ${
                            errors[`justificativa${index}`] && touched[`justificativa${index}`] ? 'border-red-500' : ''
                          }`}
                          value={item.justificativa}
                          onChange={(e) => {
                            const newRespostas = [...formData.respostas];
                            newRespostas[index].justificativa = e.target.value;
                            setFormData({ ...formData, respostas: newRespostas });

                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onBlur={() => handleBlur(`justificativa${index}`)}
                          rows={1}
                        />
                        {errors[`justificativa${index}`] && touched[`justificativa${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`justificativa${index}`]}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seção CHEGAMOS AO FINAL */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">CHEGAMOS AO FINAL</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-teal-700 font-medium mb-2">
                  AGORA PARE, PENSE E ESCREVA COMO VOCÊ ESTA SE SENTINDO, OU SE SENTIU NO DESEMPENHO DESSA TAREFA <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="feedbackFinal"
                  className={`w-full p-2 border rounded-lg h-32 ${errors.feedbackFinal && touched.feedbackFinal ? 'border-red-500' : ''}`}
                  value={formData.feedbackFinal}
                  onChange={(e) => {
                    setFormData({ ...formData, feedbackFinal: e.target.value });
                    if (touched.feedbackFinal) {
                      handleBlur('feedbackFinal');
                    }
                  }}
                  onBlur={() => handleBlur('feedbackFinal')}
                />
                {errors.feedbackFinal && touched.feedbackFinal && (
                  <p className="text-red-500 text-sm mt-1">{errors.feedbackFinal}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção NOSSO AGRADECIMENTO */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-teal-700 mb-6">NOSSO AGRADEC
IMENTO</h2>
            <p className="text-teal-700 mb-4">
              Desde já agradecemos a seu empenho e participação neste projeto inteiramente DEDICADO A VOCÊ!
            </p>

            <div className="flex justify-between items-start mt-8">
              <div className="text-left">
                <p className="font-medium">Wedja Josefa Granja Costa</p>
                <p className="text-sm">CRP11/0002</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Carlos Irineu Granja Costa</p>
                <p className="text-sm">CRP11/4334</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg text-center text-sm text-gray-600">
            <p>
              Instituto Wedja de Socionomia SS Ltda - CNPJ: 07.922.254/0001-06
            </p>
            <p>
              Rua Joao Carvalho Nº800 - sala 503 - Aldeota - Fortaleza - Ceará - CEP 60.140-140
            </p>
            <p>
              WhatsApp (85)99782.0069 / (85)3224-1587
            </p>
          </footer>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;