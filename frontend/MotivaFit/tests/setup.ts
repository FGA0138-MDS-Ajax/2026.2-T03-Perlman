import { configure } from '@testing-library/react';

// Com vários arquivos rodando em paralelo, o limite padrão de 1 s do findBy* gera falhas intermitentes.
configure({ asyncUtilTimeout: 3000 });
