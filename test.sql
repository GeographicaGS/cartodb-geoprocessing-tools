-- drop view trash.erase_point;
-- create view trash.erase_point as (
-- with a as (select * from busstops_losangeles where st_isvalid(the_geom)),
--   b as (select * from neighborhood_councils_losangeles where st_isvalid(the_geom))

--   select ROW_NUMBER() OVER () AS cartodb_id,a.the_geom from a
--     left join b on st_intersects(a.the_geom,b.the_geom)
--   where b.the_geom is null
-- );

-- --select count(*) from trash.erase_point;

-- drop view trash.erase_line;
-- create view trash.erase_line as (
-- with a as (select * from tornado),
--   b as (select * from sf_stclines),
--   ageom as (select a.cartodb_id from a),
--   bgeom as (select b.cartodb_id from b)

--     select a.cartodb_id as a, b.cartodb_id as b

--     from ageom a, bgeom b

-- );

--select count(*) from trash.erase_line;


-- with a as (select * from stormevents_locations_2014 LIMIT 5000),
--  b as (select * from chicago_major_streets LIMIT 5000) ,
--  ageom as (select the_geom from a),
--  bgeom as (select the_geom from b)

--  select a.the_geom
--  from ageom a
--  left join bgeom b on st_intersects(a.the_geom,b.the_geom)
--  where b.the_geom is null;
--with a as (select * from stormevents_locations_2014 LIMIT 5000),
--b as (select * from stormevents_locations_2014 LIMIT 5000)


-- explain analyze verbose
-- with a as (select * from chicago_major_streets),
--   b as (select * from stormevents_locations_2014)
-- select a.the_geom from
--  a,
--  b
-- where st_intersects(a.the_geom,b.the_geom);

-- explain
-- select a.the_geom from
--  chicago_major_streets a,
--  stormevents_locations_2014 b
-- where st_intersects(a.the_geom,b.the_geom)

--explain analyze

--

-- drop table if exists trash.erase_poly;
-- create table trash.erase_poly as (
--
-- SELECT * FROM (
--   SELECT st_multi(ST_Difference(a.the_geom,ST_Union(b.the_geom))) AS the_geom
--
--    FROM mf04_un_litologica a
--    INNER JOIN estacion_buffer_500 b ON ST_Intersects(a.the_geom, b.the_geom)
--    GROUP BY a.the_geom
-- ) s
-- where not st_isempty(the_geom)
--
-- UNION ALL
--
-- SELECT a.the_geom FROM mf04_un_litologica a
--   left join estacion_buffer_500 b  on ST_Intersects(a.the_geom, b.the_geom)
--   where b.the_geom is null
--
-- );


-- drop table if exists trash.erase_poly;
-- create table trash.erase_poly as (
--
-- SELECT distinct a.cod_ent,a.unidad_lit,   CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,3)  ELSE the_geom  END as the_geom
-- FROM ( SELECT st_multi(ST_Difference(a.the_geom,ST_Union(b.the_geom))) AS the_geom,a.cod_ent,a.unidad_lit
-- FROM (select * from mf04_un_litologica) a
-- INNER JOIN (select * from estacion_buffer_500) b ON ST_Intersects(a.the_geom, b.the_geom)
-- GROUP BY a.the_geom,a.cod_ent,a.unidad_lit ) a where not st_isempty(the_geom) and st_geometrytype(the_geom)='ST_MultiPolygon'
-- UNION ALL SELECT distinct a.cod_ent,a.unidad_lit,st_multi(a.the_geom) as the_geom FROM (select * from mf04_un_litologica) a left join (select * from estacion_buffer_500) b  on ST_Intersects(a.the_geom, b.the_geom) where b.the_geom is null
--
-- );

drop table if exists trash.clip;

create Table  trash.clip as (

SELECT (ST_Multi(ST_CollectionExtract(ST_Intersection(a.the_geom,ST_Union(b.the_geom)),3))) AS the_geom,a.c_estacion,a.denominaci
FROM (select * from estacion_buffer_500) a
INNER JOIN (select * from mf04_un_litologica) b ON ST_Intersects(a.the_geom,b.the_geom)
GROUP BY a.the_geom,a.c_estacion,a.denominaci
)
