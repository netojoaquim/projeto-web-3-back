--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: cliente_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cliente_role_enum AS ENUM (
    'admin',
    'cliente'
);


ALTER TYPE public.cliente_role_enum OWNER TO postgres;

--
-- Name: pagamentos_metodo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pagamentos_metodo_enum AS ENUM (
    'CARTAO',
    'BOLETO',
    'PIX'
);


ALTER TYPE public.pagamentos_metodo_enum OWNER TO postgres;

--
-- Name: pagamentos_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pagamentos_status_enum AS ENUM (
    'PENDENTE',
    'PAGO',
    'CANCELADO'
);


ALTER TYPE public.pagamentos_status_enum OWNER TO postgres;

--
-- Name: pedido_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pedido_status_enum AS ENUM (
    'ABERTO',
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'CANCELADO'
);


ALTER TYPE public.pedido_status_enum OWNER TO postgres;

--
-- Name: pedidos_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pedidos_status_enum AS ENUM (
    'ABERTO',
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'CANCELADO'
);


ALTER TYPE public.pedidos_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carrinho; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrinho (
    id integer NOT NULL,
    total numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "clienteId" integer NOT NULL
);


ALTER TABLE public.carrinho OWNER TO postgres;

--
-- Name: carrinho_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrinho_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carrinho_id_seq OWNER TO postgres;

--
-- Name: carrinho_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrinho_id_seq OWNED BY public.carrinho.id;


--
-- Name: carrinho_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrinho_item (
    id integer NOT NULL,
    quantidade integer DEFAULT 1 NOT NULL,
    valor numeric(10,2) NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    "carrinhoId" integer,
    "produtoId" integer NOT NULL
);


ALTER TABLE public.carrinho_item OWNER TO postgres;

--
-- Name: carrinho_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrinho_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carrinho_item_id_seq OWNER TO postgres;

--
-- Name: carrinho_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrinho_item_id_seq OWNED BY public.carrinho_item.id;


--
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id integer NOT NULL,
    descricao character varying NOT NULL
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- Name: categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categoria_id_seq OWNER TO postgres;

--
-- Name: categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_seq OWNED BY public.categoria.id;


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id integer NOT NULL,
    nome_completo character varying NOT NULL,
    email character varying NOT NULL,
    numero_telefone character varying NOT NULL,
    senha character varying NOT NULL,
    data_nascimento date,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    role public.cliente_role_enum DEFAULT 'cliente'::public.cliente_role_enum NOT NULL,
    ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cliente_id_seq OWNER TO postgres;

--
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


--
-- Name: endereco; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endereco (
    id integer NOT NULL,
    rua character varying NOT NULL,
    apelido character varying,
    bairro character varying NOT NULL,
    numero character varying NOT NULL,
    cidade character varying NOT NULL,
    cep character varying NOT NULL,
    estado character varying NOT NULL,
    padrao boolean DEFAULT false NOT NULL,
    "clienteId" integer NOT NULL
);


ALTER TABLE public.endereco OWNER TO postgres;

--
-- Name: endereco_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.endereco_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.endereco_id_seq OWNER TO postgres;

--
-- Name: endereco_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.endereco_id_seq OWNED BY public.endereco.id;


--
-- Name: pagamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagamentos (
    id integer NOT NULL,
    metodo public.pagamentos_metodo_enum NOT NULL,
    status public.pagamentos_status_enum DEFAULT 'PENDENTE'::public.pagamentos_status_enum NOT NULL,
    valor numeric(10,2) NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    data_atualizacao timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pagamentos OWNER TO postgres;

--
-- Name: pagamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagamentos_id_seq OWNER TO postgres;

--
-- Name: pagamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagamentos_id_seq OWNED BY public.pagamentos.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    token character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "clienteId" integer
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id integer NOT NULL,
    valor numeric(10,2) NOT NULL,
    status public.pedido_status_enum DEFAULT 'ABERTO'::public.pedido_status_enum NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    data_modificacao timestamp without time zone DEFAULT now() NOT NULL,
    "clienteId" integer,
    "pagamentoId" integer,
    endereco_entrega_id integer
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedido_id_seq OWNER TO postgres;

--
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- Name: pedido_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_itens (
    id integer NOT NULL,
    quantidade integer NOT NULL,
    valor numeric(10,2) NOT NULL,
    "pedidoId" integer,
    "produtoId" integer
);


ALTER TABLE public.pedido_itens OWNER TO postgres;

--
-- Name: pedido_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedido_itens_id_seq OWNER TO postgres;

--
-- Name: pedido_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_itens_id_seq OWNED BY public.pedido_itens.id;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id integer NOT NULL,
    valor numeric(10,2) NOT NULL,
    status public.pedidos_status_enum DEFAULT 'ABERTO'::public.pedidos_status_enum NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    data_modificacao timestamp without time zone DEFAULT now() NOT NULL,
    "clienteId" integer,
    "pagamentoId" integer
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedidos_id_seq OWNER TO postgres;

--
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- Name: produto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produto (
    id integer NOT NULL,
    nome character varying NOT NULL,
    descricao character varying,
    preco numeric(10,2) NOT NULL,
    estoque integer DEFAULT 0 NOT NULL,
    imagem character varying,
    ativo boolean DEFAULT true NOT NULL,
    "categoriaId" integer NOT NULL
);


ALTER TABLE public.produto OWNER TO postgres;

--
-- Name: produto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.produto_id_seq OWNER TO postgres;

--
-- Name: produto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produto_id_seq OWNED BY public.produto.id;


--
-- Name: carrinho id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho ALTER COLUMN id SET DEFAULT nextval('public.carrinho_id_seq'::regclass);


--
-- Name: carrinho_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho_item ALTER COLUMN id SET DEFAULT nextval('public.carrinho_item_id_seq'::regclass);


--
-- Name: categoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);


--
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- Name: endereco id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco ALTER COLUMN id SET DEFAULT nextval('public.endereco_id_seq'::regclass);


--
-- Name: pagamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamentos ALTER COLUMN id SET DEFAULT nextval('public.pagamentos_id_seq'::regclass);


--
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- Name: pedido_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_itens ALTER COLUMN id SET DEFAULT nextval('public.pedido_itens_id_seq'::regclass);


--
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- Name: produto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produto ALTER COLUMN id SET DEFAULT nextval('public.produto_id_seq'::regclass);


--
-- Data for Name: carrinho; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrinho (id, total, "clienteId") FROM stdin;
3	0.00	5
4	0.00	6
1	22500.00	1
6	0.00	2
\.


--
-- Data for Name: carrinho_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrinho_item (id, quantidade, valor, data_criacao, "carrinhoId", "produtoId") FROM stdin;
1	2	5000.00	2025-10-29 16:52:14.385925	1	1
2	5	200.00	2025-10-29 18:23:45.799357	1	2
\.


--
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id, descricao) FROM stdin;
4	Vestimenta
1	tecnologia
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id, nome_completo, email, numero_telefone, senha, data_nascimento, data_criacao, role, ativo) FROM stdin;
2	maria maia	maria@email.com	8195958284	$2b$10$r7OJXkBFTCxSd8F4VVG4eu4mN9ABV9wupdeBulrRMXehEMy9al0tm	2001-11-22	2025-10-29 18:25:05.151499	cliente	t
5	pedro	pedro@email.com	(81) 99999-9999	$2b$10$v8GyaZBDUuegKGbaF55EFOqgLSm564XwfjhYNGNvPh//c2y1tqNfu	2001-11-22	2025-10-30 20:25:57.165773	cliente	t
6	beto silvio	beto@email.com	(89) 3535-2024	$2b$10$OUF8eqkH58JCK2CRtdBzfu5xM0QdDKkTA.EmTJI3Hf/UpN2mQLVE.	1893-02-05	2025-10-31 01:31:12.31737	cliente	t
1	João da Silva matos ds	joao@email.com	81995650419	$2b$10$uYQElOv089qku4UCBLSZJOABDvyEkJxdQSpZVNBCNSoOvrIcwxFv.	1987-05-11	2025-10-29 16:08:55.32983	admin	t
\.


--
-- Data for Name: endereco; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endereco (id, rua, apelido, bairro, numero, cidade, cep, estado, padrao, "clienteId") FROM stdin;
3	rua maria	casa	sta maria	158	barbara	54800000	RS	f	5
8	rua aaaa	casa praiaaaa	Centro	123	cabo	12345678	PE	t	1
2	rua aaaa	maria endereco 1	Centro	123	cabo	12345678	PE	t	2
\.


--
-- Data for Name: pagamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagamentos (id, metodo, status, valor, data_criacao, data_atualizacao) FROM stdin;
1	CARTAO	PENDENTE	16200.00	2025-10-31 18:10:02.97496	2025-10-31 18:10:02.97496
2	CARTAO	PENDENTE	16200.00	2025-10-31 18:25:19.743465	2025-10-31 18:25:19.743465
3	CARTAO	PENDENTE	16200.00	2025-10-31 18:26:03.291687	2025-10-31 18:26:03.291687
4	CARTAO	PENDENTE	16200.00	2025-10-31 18:28:00.183392	2025-10-31 18:28:00.183392
5	CARTAO	PENDENTE	16200.00	2025-10-31 18:41:55.183474	2025-10-31 18:41:55.183474
6	CARTAO	PENDENTE	16200.00	2025-10-31 18:50:37.029526	2025-10-31 18:50:37.029526
7	CARTAO	PENDENTE	16200.00	2025-10-31 18:59:42.228652	2025-10-31 18:59:42.228652
8	CARTAO	PENDENTE	16200.00	2025-10-31 19:07:53.725119	2025-10-31 19:07:53.725119
9	CARTAO	PENDENTE	16200.00	2025-10-31 19:15:55.327192	2025-10-31 19:15:55.327192
10	CARTAO	PENDENTE	16200.00	2025-10-31 19:17:20.660814	2025-10-31 19:17:20.660814
11	CARTAO	PENDENTE	6000.00	2025-10-31 19:40:45.953552	2025-10-31 19:40:45.953552
12	CARTAO	PENDENTE	6000.00	2025-10-31 19:50:46.178361	2025-10-31 19:50:46.178361
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, token, "createdAt", "expiresAt", "clienteId") FROM stdin;
\.


--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido (id, valor, status, data_criacao, data_modificacao, "clienteId", "pagamentoId", endereco_entrega_id) FROM stdin;
1	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:10:02.97496	2025-10-31 18:10:02.97496	2	1	2
2	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:25:19.743465	2025-10-31 18:25:19.743465	2	2	2
3	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:26:03.291687	2025-10-31 18:26:03.291687	2	3	2
4	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:28:00.183392	2025-10-31 18:28:00.183392	2	4	2
5	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:41:55.183474	2025-10-31 18:41:55.183474	2	5	2
6	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:50:37.029526	2025-10-31 18:50:37.029526	2	6	2
7	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 18:59:42.228652	2025-10-31 18:59:42.228652	2	7	2
8	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 19:07:53.725119	2025-10-31 19:07:53.725119	2	8	2
9	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 19:15:55.327192	2025-10-31 19:15:55.327192	2	9	2
10	16200.00	AGUARDANDO_PAGAMENTO	2025-10-31 19:17:20.660814	2025-10-31 19:17:20.660814	2	10	2
11	6000.00	AGUARDANDO_PAGAMENTO	2025-10-31 19:40:45.953552	2025-10-31 19:40:45.953552	2	11	2
12	6000.00	AGUARDANDO_PAGAMENTO	2025-10-31 19:50:46.178361	2025-10-31 19:50:46.178361	2	12	2
\.


--
-- Data for Name: pedido_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_itens (id, quantidade, valor, "pedidoId", "produtoId") FROM stdin;
1	2	6000.00	1	1
2	2	2100.00	1	2
3	2	6000.00	2	1
4	2	2100.00	2	2
5	2	6000.00	3	1
6	2	2100.00	3	2
7	2	6000.00	4	1
8	2	2100.00	4	2
9	2	6000.00	5	1
10	2	2100.00	5	2
11	2	6000.00	6	1
12	2	2100.00	6	2
13	2	6000.00	7	1
14	2	2100.00	7	2
15	2	6000.00	8	1
16	2	2100.00	8	2
17	2	6000.00	9	1
18	2	2100.00	9	2
19	2	6000.00	10	1
20	2	2100.00	10	2
21	1	6000.00	11	1
22	1	6000.00	12	1
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, valor, status, data_criacao, data_modificacao, "clienteId", "pagamentoId") FROM stdin;
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produto (id, nome, descricao, preco, estoque, imagem, ativo, "categoriaId") FROM stdin;
2	camisa preta 	123456	2100.00	5	1c716dd641e44393f5a1ca0b43585c23.jpeg	t	4
1	iphone 15 256gb preto	iphone 15 256gb preto lindo	6000.00	2	10aeeadb57b6a1e109b9b15e290d1faab8.jpeg	t	1
\.


--
-- Name: carrinho_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrinho_id_seq', 6, true);


--
-- Name: carrinho_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrinho_item_id_seq', 40, true);


--
-- Name: categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_seq', 5, true);


--
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_id_seq', 6, true);


--
-- Name: endereco_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.endereco_id_seq', 8, true);


--
-- Name: pagamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagamentos_id_seq', 12, true);


--
-- Name: pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_id_seq', 12, true);


--
-- Name: pedido_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_itens_id_seq', 22, true);


--
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 1, false);


--
-- Name: produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produto_id_seq', 4, true);


--
-- Name: pagamentos PK_0127f8bc8386b0e522c7cc5a9fc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamentos
    ADD CONSTRAINT "PK_0127f8bc8386b0e522c7cc5a9fc" PRIMARY KEY (id);


--
-- Name: cliente PK_18990e8df6cf7fe71b9dc0f5f39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY (id);


--
-- Name: endereco PK_2a6880f71a7f8d1c677bb2a32a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco
    ADD CONSTRAINT "PK_2a6880f71a7f8d1c677bb2a32a8" PRIMARY KEY (id);


--
-- Name: pedido_itens PK_82e4f6ce11df2878bc7a54c5797; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_itens
    ADD CONSTRAINT "PK_82e4f6ce11df2878bc7a54c5797" PRIMARY KEY (id);


--
-- Name: produto PK_99c4351f9168c50c0736e6a66be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT "PK_99c4351f9168c50c0736e6a66be" PRIMARY KEY (id);


--
-- Name: pedido PK_af8d8b3d07fae559c37f56b3f43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT "PK_af8d8b3d07fae559c37f56b3f43" PRIMARY KEY (id);


--
-- Name: carrinho PK_c3e0fa0f35ffe1bad1385bb5110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho
    ADD CONSTRAINT "PK_c3e0fa0f35ffe1bad1385bb5110" PRIMARY KEY (id);


--
-- Name: carrinho_item PK_c43133415dea6437f56421b1fe8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho_item
    ADD CONSTRAINT "PK_c43133415dea6437f56421b1fe8" PRIMARY KEY (id);


--
-- Name: password_reset_tokens PK_d16bebd73e844c48bca50ff8d3d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY (id);


--
-- Name: pedidos PK_ebb5680ed29a24efdc586846725; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "PK_ebb5680ed29a24efdc586846725" PRIMARY KEY (id);


--
-- Name: categoria PK_f027836b77b84fb4c3a374dc70d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT "PK_f027836b77b84fb4c3a374dc70d" PRIMARY KEY (id);


--
-- Name: carrinho REL_9b4d28c550905a9b86af2b7332; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho
    ADD CONSTRAINT "REL_9b4d28c550905a9b86af2b7332" UNIQUE ("clienteId");


--
-- Name: pedido REL_d5038b8febbf2f6782a44e09bb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT "REL_d5038b8febbf2f6782a44e09bb" UNIQUE ("pagamentoId");


--
-- Name: pedidos REL_f77691d346aa7f8a38fd4802fc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "REL_f77691d346aa7f8a38fd4802fc" UNIQUE ("pagamentoId");


--
-- Name: cliente UQ_503f81286c5e49acd6a832abf43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT "UQ_503f81286c5e49acd6a832abf43" UNIQUE (email);


--
-- Name: password_reset_tokens UQ_ab673f0e63eac966762155508ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE (token);


--
-- Name: carrinho_item FK_1256a8377f0eed7fcae05ff09f5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho_item
    ADD CONSTRAINT "FK_1256a8377f0eed7fcae05ff09f5" FOREIGN KEY ("carrinhoId") REFERENCES public.carrinho(id) ON DELETE CASCADE;


--
-- Name: pedido FK_2730a0c3947641edf256551f10c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT "FK_2730a0c3947641edf256551f10c" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id);


--
-- Name: pedido_itens FK_46f6c7e2d999a308343841272a1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_itens
    ADD CONSTRAINT "FK_46f6c7e2d999a308343841272a1" FOREIGN KEY ("produtoId") REFERENCES public.produto(id);


--
-- Name: pedidos FK_485346a40b61bb8ae3a98f5400c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "FK_485346a40b61bb8ae3a98f5400c" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id);


--
-- Name: pedido_itens FK_4905b2c69d25dcaffa46110e0c0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_itens
    ADD CONSTRAINT "FK_4905b2c69d25dcaffa46110e0c0" FOREIGN KEY ("pedidoId") REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- Name: pedido FK_71f16b87f63bbc6da39fa88c97f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT "FK_71f16b87f63bbc6da39fa88c97f" FOREIGN KEY (endereco_entrega_id) REFERENCES public.endereco(id);


--
-- Name: produto FK_8a1e81267ae184590ce1ee9a39b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT "FK_8a1e81267ae184590ce1ee9a39b" FOREIGN KEY ("categoriaId") REFERENCES public.categoria(id);


--
-- Name: carrinho FK_9b4d28c550905a9b86af2b73324; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho
    ADD CONSTRAINT "FK_9b4d28c550905a9b86af2b73324" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- Name: endereco FK_a72230afed1a3aefa80bffe85bf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco
    ADD CONSTRAINT "FK_a72230afed1a3aefa80bffe85bf" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- Name: pedido FK_d5038b8febbf2f6782a44e09bbb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT "FK_d5038b8febbf2f6782a44e09bbb" FOREIGN KEY ("pagamentoId") REFERENCES public.pagamentos(id);


--
-- Name: carrinho_item FK_db6bd9f5343c5339ac22e3f50dc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrinho_item
    ADD CONSTRAINT "FK_db6bd9f5343c5339ac22e3f50dc" FOREIGN KEY ("produtoId") REFERENCES public.produto(id);


--
-- Name: pedidos FK_f77691d346aa7f8a38fd4802fcd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "FK_f77691d346aa7f8a38fd4802fcd" FOREIGN KEY ("pagamentoId") REFERENCES public.pagamentos(id);


--
-- Name: password_reset_tokens FK_fc6f3f7053be65a1e173ea48096; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "FK_fc6f3f7053be65a1e173ea48096" FOREIGN KEY ("clienteId") REFERENCES public.cliente(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

