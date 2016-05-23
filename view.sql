DROP view trash.erase;
CREATE or replace VIEW trash.erase as 
WITH a as (select * from prov), b as (select * from comar),
diff as ( SELECT distinct a.cod_ent,a.cod_prov,a.provincia,ST_Multi(ST_Difference(a.the_geom,b.the_geom)) as the_geom 
  FROM a,b WHERE st_intersects(a.the_geom,b.the_geom) ),
nodiff as ( SELECT distinct a.cod_ent,a.cod_prov,a.provincia,ST_Multi(a.the_geom) as the_geom 
  FROM a,b WHERE not st_intersects(a.the_geom,b.the_geom) ),
 --r as (SELECT * from diff UNION ALL select * from nodiff) 
 r as (SELECT * from diff ) 
 select ROW_NUMBER() OVER () AS cartodb_id,cod_ent,cod_prov,provincia, CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,3) ELSE the_geom END as the_geom 

 FROM r WHERE st_geometrytype(the_geom)='ST_GeometryCollection' OR st_geometrytype(the_geom) ='ST_MultiPolygon';


 DROP view trash.erase2;
CREATE or replace VIEW trash.erase2 as 
WITH a as (select * from prov), b as (select st_union(the_geom) as the_geom from comar),
diff as ( SELECT distinct ROW_NUMBER() OVER () AS cartodb_id,a.cod_ent,a.cod_prov,a.provincia,ST_Multi(ST_Difference(a.the_geom,b.the_geom)) as the_geom 
  FROM a,b 

  WHERE st_intersects(a.the_geom,b.the_geom) )

select * from diff;


drop view trash.clip;
create view trash.clip as (

  WITH a as (select * from prov), b as (select * from comar), 

clip as ( SELECT distinct st_multi(st_intersection(a.the_geom,b.the_geom)) as the_geom 
  FROM a,b 
  WHERE a.the_geom && b.the_geom AND st_intersects(a.the_geom,b.the_geom)),

clip_union as (
  select st_union(the_geom) as the_geom from clip
)

select ROW_NUMBER() OVER () AS cartodb_id, cod_ent,cod_prov,provincia,
  CASE WHEN st_geometrytype(c.the_geom)='ST_GeometryCollection' 
    then ST_CollectionExtract(c.the_geom,3) 
    ELSE c.the_geom 
    END as the_geom 
from clip_union c
left join a ON st_within(st_pointonsurface(a.the_geom),c.the_geom)
where st_geometrytype(c.the_geom)='ST_GeometryCollection' OR st_geometrytype(c.the_geom)='ST_MultiPolygon');

drop view trash.union;
CREATE or replace VIEW trash.union as 
WITH a as (select * from prov), 
b as (SELECT * FROM comar),

ai as (select distinct a.cartodb_id,a.the_geom from a,b where st_intersects(a.the_geom,b.the_geom)),
ani as (select a.cartodb_id,a.the_geom from a left join ai ON a.cartodb_id=ai.cartodb_id WHERE ai.cartodb_id is null ),
bi as (select distinct b.cartodb_id,b.the_geom from a,b where st_intersects(a.the_geom,b.the_geom)),
bni as (select b.cartodb_id,b.the_geom from b left join bi ON b.cartodb_id=bi.cartodb_id WHERE bi.cartodb_id is null ),
abni as (select * from ani union select * from bni),
abi as (
  select ai.cartodb_id, st_union(ai.the_geom,bi.the_geom) as the_geom from ai,bi 
  where st_intersects(ai.the_geom,bi.the_geom)
),
r as (select * from abi union all select * from abni)

--select * from r;

select ROW_NUMBER() OVER () AS cartodb_id,
    CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,3) 
          ELSE the_geom 
    END as the_geom 

FROM r WHERE st_geometrytype(the_geom)='ST_GeometryCollection' OR st_geometrytype(the_geom) ='ST_MultiPolygon';


DROP view trash.sev;
CREATE or replace VIEW trash.sev as SELECT * FROM ign_spanish_adm2_provinces_displaced_canary  where natcode='34014100000';

drop view trash.testunion;
create view trash.testunion as (
  with a as (
    select the_geom from trash.poligono_a 
    union 
    select the_geom from trash.poligono_b
  ),
  ai as (
  select distinct a1.the_geom from a a1,a a2 where not st_equals(a1.the_geom,a2.the_geom) and st_intersects(a1.the_geom,a2.the_geom)),

  ri as (
    select st_intersection(ai1.the_geom,ai2.the_geom) as the_geom 
    from ai ai1, ai ai2
    where not st_equals(ai1.the_geom,ai2.the_geom) 
  ),

  rni as (
    select ST_Difference(ai1.the_geom,ai2.the_geom) as the_geom 
    from ai ai1, ai ai2
    where not st_equals(ai1.the_geom,ai2.the_geom) 
  ),

  r as (select * from ri union all select * from rni)
  

  select ROW_NUMBER() OVER () AS gid,the_geom from r
);


-- drop view trash.testunion2;
-- create view trash.testunion2 as (
--   with a as (select * from trash.poligono_a),
--   b as (select * from trash.poligono_b),
--   ai as (select distinct a.* from a,b where st_intersects(a.the_geom,b.the_geom)),
--   ani as (select a.* from a left join ai ON a.gid=ai.gid WHERE ai.gid is null ),
--   bi as (select distinct b.* from a,b where st_intersects(a.the_geom,b.the_geom)),
--   bni as (select b.* from b left join bi ON b.gid=bi.gid WHERE bi.gid is null ),
--   ri1 as (
--     select ai.gid as gid1,bi.gid as gid2,ST_Difference(ai.the_geom,bi.the_geom) as the_geom 
--     from ai,bi
--     where st_intersects(ai.the_geom,bi.the_geom)
--   ),
--   ri2 as (
--     select ai.gid as gid1,bi.gid as gid2,st_intersection(ai.the_geom,bi.the_geom) as the_geom 
--     from ai,bi
--     where st_intersects(ai.the_geom,bi.the_geom)
--   ),
--   rni as (
--     select * from ani union all select * from bni
--   ),

--   --r as (select * from ri1 union all select * from ri2  union all select * from rni)

--   r as (select * from ri1)

--   select ROW_NUMBER() OVER () AS gid,* from r
-- );

-- drop view trash.testunion2;
-- create view trash.testunion2 as (
--   with a as (select * from trash.poligono_a),
--   b as (select * from trash.poligono_b),
--   ab as (
--     select distinct a.gid as gid1,b.gid as gid2,a.the_geom as the_geom1,b.the_geom as the_geom2
--     from a,b
--     where st_intersects(a.the_geom,b.the_geom)
--   ),
--   abdiff as (
--     select gid1,gid2,ST_Difference(the_geom1,the_geom2) as the_geom 
--     from ab
--   ),
--   badiff as (
--     select gid1,gid2,ST_Difference(the_geom2,the_geom1) as the_geom 
--     from ab
--   ),
--   abi as (
--     select gid1,gid2,st_intersection(the_geom1,the_geom2) as the_geom 
--     from ab
--   ),
--   ani as (
--     select distinct a.gid as gid1,null::integer as gid2,a.the_geom
--     from a,b
--     where not st_intersects(a.the_geom,b.the_geom)
--   ),
--   bni as (
--     select distinct null::integer as gid1,b.gid as gid2,b.the_geom
--     from a,b
--     where not st_intersects(a.the_geom,b.the_geom)
--   ),


--   --r as (select * from ri1 union all select * from ri2  union all select * from rni)

--   r as (select * from abi
--      union all select * from abdiff
--     union all select * from badiff 
--     union all select * from ani 
--     union all select * from bni)

--   select ROW_NUMBER() OVER () AS gid,* from r
-- );

drop view trash.testunion2;
create view trash.testunion2 as (
  with a as (select * from trash.poligono_a),
  b as (select * from trash.poligono_b),
  ab as (
    select distinct a.gid as gid1,b.gid as gid2,a.the_geom as the_geom1,b.the_geom as the_geom2
    from a,b
    where st_intersects(a.the_geom,b.the_geom)
  ),
  abdiff as (
    select gid1, null::integer as gid2,ST_Difference(the_geom1,the_geom2) as the_geom 
    from ab
  ),
  badiff as (
    select null::integer as gid1,gid2,ST_Difference(the_geom2,the_geom1) as the_geom 
    from ab
  ),
  abi as (
    select gid1,gid2,st_intersection(the_geom1,the_geom2) as the_geom 
    from ab
  ),
  ani as (
    select distinct a.gid as gid1,null::integer as gid2,a.the_geom
    from a 
    where the_geom not in (select the_geom1 from ab)
  ),
  bni as (
    select distinct null::integer as gid1,b.gid as gid2,b.the_geom
    from b
    where the_geom not in (select the_geom2 from ab)
  ),

  r as (
    select * from abi
    union all select * from abdiff
    union all select * from badiff 
    union all select * from ani 
    union all select * from bni
  )

  --r as (select * from ab)

  select ROW_NUMBER() OVER () AS gid,* from r
);


drop view trash.testunion3;
create view trash.testunion3 as (
  with a as (select cartodb_id as gid,the_geom from comar),
  b as (select cartodb_id as gid,the_geom from prov),
  ab as (
    select distinct a.gid as gid1,b.gid as gid2,a.the_geom as the_geom1,b.the_geom as the_geom2
    from a,b
    where st_intersects(a.the_geom,b.the_geom)
  ),
  abdiff as (
    select gid1, null::integer as gid2,ST_Multi(ST_Difference(the_geom1,the_geom2)) as the_geom 
    from ab
  ),
  badiff as (
    select null::integer as gid1,gid2,ST_Multi(ST_Difference(the_geom2,the_geom1)) as the_geom 
    from ab
    where not st_within(the_geom2,the_geom1)
  ),
  abi as (
    select gid1,gid2,ST_Multi(st_intersection(the_geom1,the_geom2)) as the_geom 
    from ab
  ),
  ani as (
    select distinct a.gid as gid1,null::integer as gid2,ST_Multi(a.the_geom)
    from a 
    where the_geom not in (select the_geom1 from ab)
  ),
  bni as (
    select distinct null::integer as gid1,b.gid as gid2,ST_Multi(b.the_geom)
    from b
    where the_geom not in (select the_geom2 from ab)
  ),

  r as (
    select * from abi
    union all select * from abdiff
    union all select * from badiff 
    union all select * from ani 
    union all select * from bni
  )

 -- r as (select * from ab)

  select ROW_NUMBER() OVER () AS gid,gid1,gid2,
  CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,3) 
          ELSE the_geom 
    END as the_geom 
     from r
);


-- drop view trash.testunion4;
-- create view trash.testunion4 as (
--   with a as (select cartodb_id as gid,the_geom from prov),
--   b as (select the_geom from comar),
--   ap as (
--     select gid,(st_dump(the_geom)).geom as the_geom from a
--   ),
--   bp as (
--     select gid,(st_dump(the_geom)).geom as the_geom from b
--   ),
--   all_lines as (
--     select St_ExteriorRing(the_geom) as the_geom from ap
--     union all 
--     select St_ExteriorRing(the_geom) as the_geom from bp
--   ),
--   noded_lines as (
--     select st_union(the_geom) as the_geom from all_lines
--   ),
--   new_polys as (
--     select ROW_NUMBER() OVER () AS gid,geom as the_geom,st_pointonsurface(geom) as pip
--       from st_dump((
--        select st_polygonize(the_geom) as the_geom from noded_lines
--       ))
--   ),

--   r as (
--     select a.gid, ap.gid as gid1, bp.gid as gid2,a.the_geom
--       from new_polys a
--       left join ap on St_Within(a.pip, ap.the_geom)
--       left join bp on St_Within(a.pip, bp.the_geom)
--   )

--   --r as (select * from noded_lines)
--   select ROW_NUMBER() OVER () AS gid,the_geom from r
-- );

drop view trash.erase3;
create view trash.erase3 as (

  WITH a as (select * from estacion_metro), pre_b as (select * from prov), b as (select st_union(the_geom) as the_geom from pre_b),
    ni as ( SELECT distinct a.cod_ent,a.situacion,a.area,a.tipo,a.nombre,a.afluencia_diaria,
      ST_Multi(ST_Difference(a.the_geom,b.the_geom)) as the_geom 
      FROM a,b 
      WHERE a.the_geom && b.the_geom AND st_intersects(a.the_geom,b.the_geom) ),

    i as (SELECT distinct a.cod_ent,a.situacion,a.area,a.tipo,a.nombre,a.afluencia_diaria,st_multi(a.the_geom) as the_geom
    FROM a,b 
    WHERE not st_intersects(a.the_geom,b.the_geom)),

    r as ( select * from i union all select * from ni)

   select ROW_NUMBER() OVER () AS cartodb_id,cod_ent,situacion,area,tipo,nombre,afluencia_diaria, 
    CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,1) ELSE the_geom END as the_geom 
   FROM r WHERE  not ST_IsEmpty(the_geom) and (st_geometrytype(the_geom)='ST_GeometryCollection' OR st_geometrytype(the_geom) ='ST_MultiPoint')

);

-- drop view trash.unionlines;
-- create view trash.unionlines as (
-- with a as (select * from linea_metro), 
--   b as (select * from via_verde), 
--   ap as (
--     select *,(st_dump(the_geom)).geom from a
--   ),
--   bp as (
--     select *,(st_dump(the_geom)).geom from b
--   ),
--   all_lines as ( select geom from ap union all select geom from bp), 
--   noded_lines as ( select st_union(geom) as geom from all_lines), 
--   new_lines as ( select geom,st_pointonsurface(geom) as pip from noded_lines ) 

--   select ROW_NUMBER() OVER () AS cartodb_id,* from noded_lines

--   -- select ROW_NUMBER() OVER () AS cartodb_id, a.cod_ent,a.tramo,a.situacion,a.tipo,a.nombre,b.ecuestre,b.cilclistas,b.misnusvali,b.viandante,
--   --   b.tipo_firme,b.trazado,b.provincia,b.municipios,b.longitud,b.cod_ent as cod_ent_2,b.nombre as nombre_2, l.geom as the_geom 
--   --   from new_lines l 
--   --   left join ap a on St_Within(l.pip, a.geom) 
--   --   left join bp b on St_Within(l.pip, b.geom)
-- )

-- drop view trash.unionlines;
-- create view trash.unionlines as (
-- with a as (select * from linea_metro), 
--   b as (select * from via_verde), 
--   a_geom as (select the_geom as geom from a),
--   b_geom as (select the_geom as geom from b),
--   ab_collection as (
--     select st_collect(array[st_intersection(a.geom,b.geom),ST_Difference(a.geom,b.geom),ST_Difference(b.geom,a.geom)]) as geom 
--       from a_geom a,b_geom b 
--       where st_intersects(a.geom,b.geom)
--   ),
--   ab_collection_dump as (
--     select (st_dump(geom)).geom from ab_collection
--   ),
--   ab as (select distinct * from ab_collection_dump where not ST_IsEmpty(geom) and st_geometrytype(geom)='ST_LineString')
--   select ROW_NUMBER() OVER () AS cartodb_id,* from ab

 
-- )

drop view trash.unionlines;
create view trash.unionlines as (
with a as (select * from linea_metro), 
  b as (select * from via_verde), 
  a_geom as (select the_geom as geom from a),
  b_geom as (select the_geom as geom from b),
  -- ab intersection
  abi as (
    select st_intersection(a.geom,b.geom) as i,
          ST_Difference(a.geom,b.geom) as a_b,
          ST_Difference(b.geom,a.geom) as b_a
      from a_geom a,b_geom b 
      where st_intersects(a.geom,b.geom)
  ),
  -- ab no intersection
  no_abi as (
    select a.geom as geom_a, b.geom as geom_b
      from a_geom a, b_geom b 
      where not st_intersects(a.geom,b.geom)
  ),
  -- Make the union
  union_all as (
    select i as geom from abi 
    union all select a_b as geom from abi where not ST_IsEmpty(a_b)
    union all select b_a as geom from abi where not ST_IsEmpty(b_a)
    --union all select geom_a as geom from no_abi where geom_a is not null
    --union all select geom_b as geom from no_abi where geom_b is not null
  ),

  qall as (
    select (st_dump(geom)).geom from union_all
  ),

  r as (
    select distinct geom from qall WHERE  st_geometrytype(geom) ='ST_LineString'
  )

  select ROW_NUMBER() OVER () AS gid,geom,a.nombre as nombre_a,b.nombre as nombre_b
   FROM r
   LEFT JOIN a ON st_within(r.geom,a.the_geom)
   LEFT JOIN b ON st_within(r.geom,b.the_geom)

 
);

drop view trash.unionlines;
create view trash.unionlines as (
with a as (select * from linea_metro), 
  b as (select * from via_verde), 
  a_geom as (select the_geom as geom from a),
  b_geom as (select the_geom as geom from b),
  -- ab intersection
  abi as (
    select unnest(array[a.geom,b.geom]) as geom from a_geom a,b_geom b where st_intersects(a.geom,b.geom)
  ),
  -- ab geometries wich are not in abi - ab intersection
  abni as (
    select st_multi(geom) as geom from a_geom where geom not in (select geom from abi)
    union all 
    select st_multi(geom) as geom from b_geom where geom not in (select geom from abi)
  ),

  intersection_processed as (
    select unnest(array[
        st_multi(st_intersection(a.geom,b.geom))
        ,st_multi(ST_Difference(a.geom,b.geom))
        ,st_multi(ST_Difference(b.geom,a.geom))
      ]) as geom
    from abi a ,abi b
    where not st_equals(a.geom,b.geom)
  ),
  -- Make the union
  union_all as (
    select * from intersection_processed
    union all 
    select * from abni
  ),

  r as (
    select distinct 
      CASE WHEN st_geometrytype(geom)='ST_GeometryCollection' then st_multi(ST_CollectionExtract(geom,2)) ELSE geom END as geom 
     from union_all 
    WHERE  st_geometrytype(geom)='ST_GeometryCollection' OR st_geometrytype(geom) ='ST_MultiLineString'
  )

  select ROW_NUMBER() OVER () AS gid,r.geom,a.nombre as nombre_a,b.nombre as nombre_b
   FROM r
   LEFT JOIN a ON st_within(r.geom,a.the_geom)
   LEFT JOIN b ON st_within(r.geom,b.the_geom)
 
);

drop view trash.unionlines;
create view trash.unionlines as (
with a as (select * from linea_metro where st_isvalid(the_geom)), 
  b as (select * from via_verde where st_isvalid(the_geom)), 
  -- put all lines together
  all_lines as (
    select (st_dump(the_geom)).geom  from a 
    union all
    select (st_dump(the_geom)).geom  from b 
  ),
  noded_lines as (
    select st_union(geom) as geom from all_lines
  ),
  -- decompose back again
  non_intersect_lines as (
    select distinct (st_dump(geom)).geom from noded_lines
  ),
  -- get attributes
  lines_attributes as (
    select l.geom,a.cod_ent,a.tramo,a.situacion,a.tipo,a.nombre,b.ecuestre,b.cilclistas,b.misnusvali,
      b.viandante,b.tipo_firme,b.trazado,b.provincia,b.municipios,
      b.longitud,b.cod_ent as cod_ent_2,b.nombre as nombre_2
     from non_intersect_lines l 
     left join a on st_within(l.geom,a.the_geom) 
     left join b on st_within(l.geom,b.the_geom) 
  )
  select ROW_NUMBER() OVER () AS gid,* from lines_attributes
);

drop view trash.unionlines2;
create view trash.unionlines2 as (
with a as (select * from linea_metro where st_isvalid(the_geom)), 
  b as (select * from via_verde where st_isvalid(the_geom)), 

  a_dump as (select *,(st_dump(the_geom)).geom from a), 
  b_dump as (select *,(st_dump(the_geom)).geom from b), 

  all_lines as (
    select (st_dump(the_geom)).geom  from a 
    union all
    select (st_dump(the_geom)).geom  from b 
  ),
  noded_lines as (
    select st_union(geom) as geom from all_lines
  ),
  --decompose back again
  non_intersect_lines as (
    select distinct (st_dump(geom)).geom from noded_lines
  )

  select ROW_NUMBER() OVER () AS gid,* from non_intersect_lines
 
);
--select st_geometrytype(geom) from trash.unionlines;
--select count(*) from trash.unionlines;

-- -- drop view trash.unionlinestest;
-- -- create view trash.unionlinestest as (

-- -- )

--select St_within(ST_GeomFromText('LINESTRING(2 2, 4 4)'),ST_GeomFromText('LINESTRING(0 0, 1 1, 5 5)'));

-- with a as (select ST_GeomFromText('LINESTRING(-71.160281 42.258729,-71.160837 42.259113,-71.161144 42.25932)') as geom ), 
-- b as (select st_collect(array[a.geom,st_centroid(a.geom),st_pointonsurface(a.geom)]) as geom from a),
-- c as (select (st_dump(b.geom)).geom from b)
-- select geom,st_geometrytype(c.geom) from c;


drop view trash.erase;
create view trash.erase as (
with a as (select * from linea_metro where st_isvalid(the_geom)), 
  b as (select * from via_verde where st_isvalid(the_geom)), 

  a_dump as (select *,(st_dump(the_geom)).geom from a), 
  b_dump as (select *,(st_dump(the_geom)).geom from b), 

  all_lines as (
    select (st_dump(the_geom)).geom  from a 
    union all
    select (st_dump(the_geom)).geom  from b 
  ),
  noded_lines as (
    select st_union(geom) as geom from all_lines
  ),
  --decompose back again
  non_intersect_lines as (
    select distinct (st_dump(geom)).geom from noded_lines
  )

  select ROW_NUMBER() OVER () AS gid,* from non_intersect_lines
 
);


