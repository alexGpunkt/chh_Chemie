-- ============================================================
-- Chemie 7–10 · Supabase-Abgleich v3 · STRENG LESEND
--
-- Diese Datei enthält ausschließlich SELECT-Abfragen. Sie verändert
-- weder Tabellen noch Funktionen, Policies, Rechte oder Nutzdaten.
-- Sie ist absichtlich auch auf einem älteren/unvollständigen Chemie710-
-- Schema ausführbar: fehlende Sollobjekte werden als "vorhanden = false"
-- beziehungsweise mit NULL bei Rechten angezeigt, statt den Abgleich
-- vorzeitig abzubrechen.
--
-- Im nächsten Arbeitsschritt im Supabase SQL Editor ausführen und die
-- Ergebnisblöcke mit dem v3-Sollstand vergleichen.
-- ============================================================

-- A · Solltabellen, Existenz, RLS und grobe Statistik
with soll(tabelle) as (
  values
    ('chemie710_students'),
    ('chemie710_events'),
    ('chemie710_progress'),
    ('chemie710_wartung_laeufe'),
    ('chemie710_teachers'),
    ('chemie710_teacher_audit'),
    ('chemie710_student_tokens'),
    ('chemie710_unterricht'),
    ('chemie710_freigaben'),
    ('chemie710_lernzeit'),
    ('chemie710_warmup_ergebnisse')
), tabellen as (
  select c.relname as tabelle,
         c.relrowsecurity as rls_aktiv,
         c.relforcerowsecurity as rls_erzwungen
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
), statistik as (
  select relname as tabelle, n_live_tup::bigint as geschaetzte_zeilen
  from pg_stat_user_tables
  where schemaname = 'public'
)
select s.tabelle,
       (t.tabelle is not null) as vorhanden,
       t.rls_aktiv,
       t.rls_erzwungen,
       st.geschaetzte_zeilen
from soll s
left join tabellen t using (tabelle)
left join statistik st using (tabelle)
order by s.tabelle;

-- B · Vorhandene Chemie710-Policies
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename like 'chemie710_%'
order by tablename, policyname;

-- C · Vorhandene Funktionen, Signaturen und SECURITY DEFINER
select p.proname as funktion,
       pg_get_function_identity_arguments(p.oid) as argumente,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname like 'chemie710_%'
order by p.proname, argumente;

-- D · Tabellenrechte der Browserrollen
select grantee, table_name,
       string_agg(privilege_type, ', ' order by privilege_type) as rechte
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'chemie710_%'
  and grantee in ('anon','authenticated')
group by grantee, table_name
order by table_name, grantee;

-- E · Kritische Funktionsrechte.
-- to_regprocedure() liefert bei einer noch fehlenden Funktion NULL;
-- dadurch funktioniert dieser Block auch VOR der Migration auf den v3-Sollstand.
with pruefung(rolle, signatur, soll_execute) as (
  values
    ('anon',          'public.chemie710_student_anmelden(text,text,integer)', true),
    ('anon',          'public.chemie710_student_sitzung()',                  true),
    ('anon',          'public.chemie710_lernmodus()',                        true),
    ('anon',          'public.chemie710_lernzeit_melden(text,integer)',      true),
    ('anon',          'public.chemie710_warmup_melden(integer,integer,text,text,text,integer,text[])', true),
    ('anon',          'public.chemie710_validate_student_login(text,text)',  false),
    -- Die Bewertungsseite gehoert der Lehrkraft, nicht dem Browser des Kindes.
    ('anon',          'public.chemie710_warmup_uebersicht(text,integer)',    false),
    ('anon',          'public.chemie710_bewertungsart_setzen(uuid,text)',    false),
    ('authenticated', 'public.chemie710_warmup_uebersicht(text,integer)',    true),
    ('authenticated', 'public.chemie710_bewertungsart_setzen(uuid,text)',    true),
    ('authenticated', 'public.chemie710_lehrkraft_freischalten(text,text)',  false),
    ('authenticated', 'public.chemie710_lehrkraft_sperren(text,text)',       false)
), aufloesung as (
  select rolle, signatur, soll_execute, to_regprocedure(signatur) as oid
  from pruefung
)
select rolle,
       signatur,
       soll_execute,
       (oid is not null) as vorhanden,
       case when oid is null then null
            else has_function_privilege(rolle, oid, 'EXECUTE')
       end as execute_aktuell
from aufloesung
order by rolle, signatur;

-- F · Cron-Erweiterung. Keine Abfrage von cron.job, weil die Relation bei
-- nicht installierter Erweiterung selbst in einer bedingten SELECT-Abfrage
-- nicht auflösbar wäre.
select exists (
  select 1 from pg_extension where extname = 'pg_cron'
) as pg_cron_installiert,
(
  select extversion from pg_extension where extname = 'pg_cron'
) as pg_cron_version;

-- G · Zusammenfassung aller aktuell vorhandenen Chemie710-Tabellen mit
-- statistischer Zeilenschätzung. Es werden keine Inhaltsdaten ausgegeben.
select schemaname,
       relname as tabelle,
       n_live_tup::bigint as geschaetzte_zeilen,
       last_analyze,
       last_autoanalyze
from pg_stat_user_tables
where schemaname = 'public' and relname like 'chemie710_%'
order by relname;
