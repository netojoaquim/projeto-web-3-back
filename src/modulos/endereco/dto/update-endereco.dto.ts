export class UpdateEnderecoDto {
    rua?: string;
    bairro?: string;    
    numero?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    padrao?: boolean;
    clienteId?: number;
    apelido?: string;
}