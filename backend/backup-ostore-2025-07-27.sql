--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(20),
    birth_date date,
    address jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    health_conditions text,
    lifestyle_notes text
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    expense_date date NOT NULL,
    category character varying(255) NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: eye_prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eye_prescriptions (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    exam_date date DEFAULT CURRENT_DATE NOT NULL,
    examiner_name character varying(255),
    od_sph character varying(10),
    od_cyl character varying(10),
    od_axis character varying(10),
    od_add character varying(10),
    od_prism character varying(10),
    os_sph character varying(10),
    os_cyl character varying(10),
    os_axis character varying(10),
    os_add character varying(10),
    os_prism character varying(10),
    pd character varying(10),
    sh character varying(10),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.eye_prescriptions OWNER TO postgres;

--
-- Name: eye_prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eye_prescriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eye_prescriptions_id_seq OWNER TO postgres;

--
-- Name: eye_prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eye_prescriptions_id_seq OWNED BY public.eye_prescriptions.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id integer NOT NULL,
    invoice_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price_per_unit numeric(10,2) NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_id_seq OWNER TO postgres;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    customer_id integer,
    invoice_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    discount_amount numeric(10,2) DEFAULT 0.00,
    promotion_used character varying(255),
    user_id integer
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(100),
    category character varying(100),
    cost_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    selling_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    quantity_on_hand numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    properties text,
    unit_name character varying(50) DEFAULT 'ชิ้น'::character varying,
    is_active boolean DEFAULT true
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: shop_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shop_info (
    id integer DEFAULT 1 NOT NULL,
    shop_name character varying(255),
    address text,
    phone character varying(50),
    tax_id character varying(20),
    logo_path character varying(255),
    CONSTRAINT single_row CHECK ((id = 1))
);


ALTER TABLE public.shop_info OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    role character varying(50) DEFAULT 'staff'::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: eye_prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eye_prescriptions ALTER COLUMN id SET DEFAULT nextval('public.eye_prescriptions_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, first_name, last_name, phone, birth_date, address, created_at, health_conditions, lifestyle_notes) FROM stdin;
11	ลุงกุ้ง	นิติพลการแว่น	0000000000	2025-01-01	{"moo": "", "soi": "", "road": "", "district": "", "province": "", "postalCode": "", "houseNumber": "", "subdistrict": ""}	2025-07-27 18:57:56.039922+07	\N	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, expense_date, category, description, amount, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: eye_prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eye_prescriptions (id, customer_id, exam_date, examiner_name, od_sph, od_cyl, od_axis, od_add, od_prism, os_sph, os_cyl, os_axis, os_add, os_prism, pd, sh, notes, created_at) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, invoice_id, product_id, quantity, price_per_unit) FROM stdin;
1	1	1	1	2400.00
2	2	3	1	1800.00
3	2	1	1	2400.00
4	3	3	1	1800.00
5	5	5	1	13500.00
6	6	1	1	2400.00
7	7	1	1	2400.00
8	8	1	1	2400.00
9	9	6	1	100.00
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, customer_id, invoice_date, total_amount, payment_method, discount_amount, promotion_used, user_id) FROM stdin;
8	\N	2025-07-27 17:48:09.898901+07	1900.00	เงินสด	500.00		2
7	\N	2025-07-27 17:27:10.253809+07	2100.00	QR Code	300.00		1
2	\N	2025-07-26 05:05:12.672614+07	3500.00	โอนเงิน	700.00		\N
4	\N	2025-07-26 16:22:04.142234+07	5200.00	เงินสด	0.00		1
6	\N	2025-07-27 16:17:10.982326+07	2100.00	เงินสด	300.00		1
1	\N	2025-07-26 03:13:31.169735+07	2000.00	เงินสด	400.00		\N
3	\N	2025-07-26 12:32:23.889757+07	1800.00	เงินสด	0.00		\N
5	\N	2025-07-26 18:25:12.91034+07	13500.00	เงินสด	0.00		1
9	11	2025-07-27 19:00:10.758147+07	100.00	เงินสด	0.00		2
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, brand, category, cost_price, selling_price, quantity_on_hand, created_at, properties, unit_name, is_active) FROM stdin;
3	LENS	HITOP	M8 -1.50	100.00	1800.00	0.00	2025-07-26 03:15:47.432128+07	\N	ชิ้น	t
1	FRAME	POLO VILLAGE 2217	FULLFRAME	120.00	2400.00	0.00	2025-07-26 02:52:32.751376+07	\N	ชิ้น	t
5	Rx Hilux 1.67 Sensity Fast Grey -1.50 PD31/EP32	HOYA	Lens Rx 	3300.00	13500.00	0.00	2025-07-26 16:33:42.364058+07	\N	ชิ้น	f
6	รับประกอบแว่น			0.00	100.00	999998.00	2025-07-27 18:59:23.468713+07		ตัว	t
\.


--
-- Data for Name: shop_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shop_info (id, shop_name, address, phone, tax_id, logo_path) FROM stdin;
1	ภัทรแว่นตาสาขาหาดใหญ่	3/7 ถนนนิพัทธ์สงเคราะห์ 1 ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา รหัสไปรษณีย์ 90110\r\n	081-6781787 หรือ 081-7666634	1-9098-024-83-71-1	/uploads/1753478882551.jpg
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, role) FROM stdin;
1	admin	$2b$10$fZ/JtIw6SAqWh7lIFn7MO.Ppf4fo/KLy1gxZK9OMH/YRBwQs3/aQ6	ภัทรนันท์ บุหลาด	admin
2	maliwan	$2b$10$G4AeeCVG9yhpD.JNJqEPxO7YHYsgW/tzPP/jHs.0az2N3YxoSyeAa	มลิวรรณ บุหลาด	staff
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 11, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- Name: eye_prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eye_prescriptions_id_seq', 7, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 9, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 9, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: eye_prescriptions eye_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eye_prescriptions
    ADD CONSTRAINT eye_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: shop_info shop_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_info
    ADD CONSTRAINT shop_info_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: invoices fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: eye_prescriptions fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eye_prescriptions
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: invoice_items fk_invoice; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items fk_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: invoices fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: expenses fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

