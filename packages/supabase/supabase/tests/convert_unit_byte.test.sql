-- internal.convert_unit_byte — verifies SI (1000) vs binary (1024) factors.

begin;

select plan(8);

select is(internal.convert_unit_byte(5, 'MiB'),         5242880::numeric,        '5 MiB → 5 242 880 bytes');
select is(internal.convert_unit_byte(5, 'MiB', 'byte'), 5242880::numeric,        '5 MiB → byte (explicit to_unit)');
select is(internal.convert_unit_byte(1, 'KiB'),         1024::numeric,           '1 KiB → 1 024 bytes');
select is(internal.convert_unit_byte(1, 'KB'),          1000::numeric,           '1 KB → 1 000 bytes (SI)');
select is(internal.convert_unit_byte(1, 'GiB', 'MiB'),  1024::numeric,           '1 GiB → 1 024 MiB');
select is(internal.convert_unit_byte(1, 'TB',  'GB'),   1000::numeric,           '1 TB → 1 000 GB');
select is(internal.convert_unit_byte(1048576, 'byte', 'MiB'), 1::numeric,        'roundtrip: byte → MiB');
select is(internal.convert_unit_byte(5, 'unknown'),     null::numeric,           'unknown unit → NULL');

select * from finish();
rollback;
