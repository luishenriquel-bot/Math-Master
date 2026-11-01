# Math Master Evolution

Math Master Evolution é um jogo educativo em navegador, criado para ajudar alunos a praticar matemática de forma divertida, com desafios, recompensas e evolução de nível.

## Regras do jogo
1. O jogador começa com 5 vidas.
2. Cada questão respondida corretamente gera XP.
3. O XP faz o jogador subir de nível.
4. Ao errar em uma lição normal, a pessoa perde uma vida.
5. No modo prática, o jogador pode treinar sem perder vidas.
6. Ao concluir o modo prática, o jogador ganha +1 vida.
7. O desafio diário pode ser feito uma vez por dia.
8. Ao completar o desafio diário, o jogador ganha 5 gemas, XP e vidas extras.
9. As gemas podem ser usadas na loja para comprar recargas de 5 vidas.
10. A recarga de 5 vidas custa 50 gemas.
11. O jogo também possui combo, cronômetro, progresso de XP e estatísticas do jogador.

## Síntese de fala

Durante uma questão, use **Ouvir pergunta** para reproduzir o enunciado em português. O controle **Leitura automática** ativa ou desativa a leitura ao abrir cada questão; essa preferência fica salva no navegador e também é incluída na exportação do perfil. A síntese usa a voz disponível no navegador e pode variar conforme o dispositivo. Se não houver suporte, o jogo informa que o recurso está indisponível.

## Melhorias aplicadas

O jogo recebeu 50 melhorias de experiência, acessibilidade, progressão e estabilidade:

1. Painel inicial com saudação personalizada.
2. Resumo visual de nível.
3. Resumo visual de XP.
4. Resumo visual de vidas.
5. Resumo visual de sequência diária.
6. Resumo visual de gemas.
7. Resumo visual de precisão.
8. Barra de progresso específica para cada lição.
9. Percentual de avanço atualizado por questão.
10. Botão de dica durante a questão.
11. Dica com resposta parcialmente mascarada.
12. Contador persistente de dicas usadas.
13. Atalho `H` para abrir dica.
14. Atalho `Esc` para voltar à tela inicial.
15. Botão de tema claro/escuro.
16. Preferência de tema persistente.
17. Controle de volume para efeitos.
18. Controle de volume persistente.
19. Preferência de movimento reduzido.
20. Respeito à preferência de movimento do sistema.
21. Notificações toast sem interromper o jogo.
22. Toast específico para conquistas.
23. Sistema de seis conquistas.
24. Conquista do primeiro acerto.
25. Conquista de combo x5.
26. Conquista de lição perfeita.
27. Conquista de desafio diário perfeito.
28. Conquista de 100 XP.
29. Conquista de exploração de todas as lições.
30. Grade visual de conquistas.
31. Conquistas persistentes no navegador.
32. Melhor combo persistente.
33. Estatística de melhor combo.
34. Estatística de dicas usadas.
35. Precisão calculada no painel inicial.
36. XP total sincronizado ao ganhar experiência.
37. Rastreamento de lições visitadas.
38. Recompensa de XP ao desbloquear conquista.
39. Estado de jogo separado da tela inicial.
40. Limpeza automática do cronômetro ao sair.
41. Controle para ligar e desligar os efeitos sonoros.
42. Inicialização segura das novas preferências.
43. Novas preferências incluídas na exportação de perfil.
44. Novas preferências reiniciadas ao redefinir estatísticas.
45. Layout de controles rápidos responsivo.
46. Layout de indicadores responsivo.
47. Layout de conquistas responsivo.
48. Botões de resposta adaptados para telas pequenas.
49. Áreas de toque otimizadas para dispositivos móveis.
50. Validação manual da tela inicial, lição, dica e estatísticas no navegador local.

## Login local e power-ups

- O login é obrigatório antes de jogar, mas não cria conta online.
- O nome, turma, idade, foto, XP, vidas, ofensiva, gemas e power-ups ficam salvos no dispositivo usando `localStorage`.
- O botão **Editar** na tela inicial permite alterar nome, turma, idade e foto.
- A foto é redimensionada antes de ser salva para reduzir o uso de armazenamento.
- O **Congelador de ofensiva** custa 80 gemas e protege a sequência quando o jogador perde um dia.
- A **Poção de XP em dobro** custa 100 gemas e dobra o XP ganho durante 15 minutos.
- O progresso pode ser exportado e importado em formato JSON pela tela de estatísticas.

## Perfil local e login no dispositivo

Na primeira abertura, o jogo solicita um nome ou apelido para criar um perfil local. Não há cadastro online, e-mail, senha ou conta externa. O navegador salva o perfil e o progresso usando `localStorage`, então o jogador não precisa criar uma nova conta sempre que abrir o jogo no mesmo dispositivo e navegador.

O perfil permite:

- editar nome ou apelido;
- informar turma e idade opcionalmente;
- escolher ou trocar a foto de perfil;
- redimensionar a foto automaticamente antes de salvar;
- manter os dados apenas no dispositivo;
- exportar e importar o perfil junto com o progresso pelo recurso de estatísticas.

Para editar as informações, use o botão **Editar** no cartão do perfil na tela inicial ou nas estatísticas. Limpar as estatísticas não apaga o perfil local.

## Como executar no Replit

Clique em **Run** e abra o Preview do Replit. O servidor Python atende em `0.0.0.0:5000`; não são necessárias dependências ou chaves secretas.
