--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.6
-- Dumped by pg_dump version 9.5.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: user_dare; Type: TABLE; Schema: public; Owner: dareity
--

CREATE TABLE user_dare (
    id integer NOT NULL,
    broadcaster_id integer NOT NULL,
    dare_id integer NOT NULL,
    pledge_amount_threshold money NOT NULL,
    npo_id integer NOT NULL,
    pledge_status money DEFAULT 0 NOT NULL
);


ALTER TABLE user_dare OWNER TO dareity;

--
-- Name: client_dare_client_dare_id_seq; Type: SEQUENCE; Schema: public; Owner: dareity
--

CREATE SEQUENCE client_dare_client_dare_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE client_dare_client_dare_id_seq OWNER TO dareity;

--
-- Name: client_dare_client_dare_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dareity
--

ALTER SEQUENCE client_dare_client_dare_id_seq OWNED BY user_dare.id;


--
-- Name: dareity_user; Type: TABLE; Schema: public; Owner: dareity
--

CREATE TABLE dareity_user (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    password character varying(80) NOT NULL,
    is_npo boolean DEFAULT false NOT NULL,
    email character varying(80) NOT NULL
);


ALTER TABLE dareity_user OWNER TO dareity;

--
-- Name: client_id_seq; Type: SEQUENCE; Schema: public; Owner: dareity
--

CREATE SEQUENCE client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE client_id_seq OWNER TO dareity;

--
-- Name: client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dareity
--

ALTER SEQUENCE client_id_seq OWNED BY dareity_user.id;


--
-- Name: dare; Type: TABLE; Schema: public; Owner: dareity
--

CREATE TABLE dare (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    npo_creator integer NOT NULL,
    expiration date DEFAULT (('now'::text)::date + '30 days'::interval) NOT NULL,
    total_pledge_amount money,
    pledge_threshold money DEFAULT 10.00 NOT NULL
);


ALTER TABLE dare OWNER TO dareity;

--
-- Name: dare_id_dare_seq; Type: SEQUENCE; Schema: public; Owner: dareity
--

CREATE SEQUENCE dare_id_dare_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dare_id_dare_seq OWNER TO dareity;

--
-- Name: dare_id_dare_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dareity
--

ALTER SEQUENCE dare_id_dare_seq OWNED BY dare.id;


--
-- Name: pledge; Type: TABLE; Schema: public; Owner: dareity
--

CREATE TABLE pledge (
    id integer NOT NULL,
    broadcaster_id integer NOT NULL,
    npo_id integer NOT NULL,
    dare_id integer NOT NULL,
    pledge_amount money NOT NULL,
    to_refund boolean DEFAULT false NOT NULL,
    user_dare_id integer NOT NULL,
    pledger_id integer NOT NULL
);


ALTER TABLE pledge OWNER TO dareity;

--
-- Name: id_pledge_id_pledge_seq; Type: SEQUENCE; Schema: public; Owner: dareity
--

CREATE SEQUENCE id_pledge_id_pledge_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE id_pledge_id_pledge_seq OWNER TO dareity;

--
-- Name: id_pledge_id_pledge_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dareity
--

ALTER SEQUENCE id_pledge_id_pledge_seq OWNED BY pledge.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dare ALTER COLUMN id SET DEFAULT nextval('dare_id_dare_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dareity_user ALTER COLUMN id SET DEFAULT nextval('client_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY pledge ALTER COLUMN id SET DEFAULT nextval('id_pledge_id_pledge_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY user_dare ALTER COLUMN id SET DEFAULT nextval('client_dare_client_dare_id_seq'::regclass);


--
-- Name: client_dare_client_dare_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dareity
--

SELECT pg_catalog.setval('client_dare_client_dare_id_seq', 3, true);


--
-- Name: client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dareity
--

SELECT pg_catalog.setval('client_id_seq', 1, false);


--
-- Data for Name: dare; Type: TABLE DATA; Schema: public; Owner: dareity
--

COPY dare (id, title, description, npo_creator, expiration, total_pledge_amount, pledge_threshold) FROM stdin;
\.


--
-- Name: dare_id_dare_seq; Type: SEQUENCE SET; Schema: public; Owner: dareity
--

SELECT pg_catalog.setval('dare_id_dare_seq', 2, true);


--
-- Data for Name: dareity_user; Type: TABLE DATA; Schema: public; Owner: dareity
--

COPY dareity_user (id, name, password, is_npo, email) FROM stdin;
\.


--
-- Name: id_pledge_id_pledge_seq; Type: SEQUENCE SET; Schema: public; Owner: dareity
--

SELECT pg_catalog.setval('id_pledge_id_pledge_seq', 1, false);


--
-- Data for Name: pledge; Type: TABLE DATA; Schema: public; Owner: dareity
--

COPY pledge (id, broadcaster_id, npo_id, dare_id, pledge_amount, to_refund, user_dare_id, pledger_id) FROM stdin;
\.


--
-- Data for Name: user_dare; Type: TABLE DATA; Schema: public; Owner: dareity
--

COPY user_dare (id, broadcaster_id, dare_id, pledge_amount_threshold, npo_id, pledge_status) FROM stdin;
1	4	5	$20.00	6	$0.00
2	0	2	$10.00	1	$0.00
3	0	2	$10.00	1	$0.00
\.


--
-- Name: Client Primary Key; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dareity_user
    ADD CONSTRAINT "Client Primary Key" PRIMARY KEY (id);


--
-- Name: dare_primary_key; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dare
    ADD CONSTRAINT dare_primary_key PRIMARY KEY (id);


--
-- Name: primary client dare key; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY user_dare
    ADD CONSTRAINT "primary client dare key" PRIMARY KEY (id);


--
-- Name: primary pledge key; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY pledge
    ADD CONSTRAINT "primary pledge key" PRIMARY KEY (id);


--
-- Name: unique dare title; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dare
    ADD CONSTRAINT "unique dare title" UNIQUE (title);


--
-- Name: unique name; Type: CONSTRAINT; Schema: public; Owner: dareity
--

ALTER TABLE ONLY dareity_user
    ADD CONSTRAINT "unique name" UNIQUE (name);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

