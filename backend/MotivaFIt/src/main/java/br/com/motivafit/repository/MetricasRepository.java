package br.com.motivafit.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface MetricasRepository extends Repository<br.com.motivafit.entity.RegistroDiario, Long> {
    @Query(value = "SELECT to_char(date_trunc(:agrupamento,r.executado_em AT TIME ZONE 'America/Sao_Paulo'),'YYYY-MM-DD'),c.id,c.nome,c.modalidade,count(*),max(r.carga_kg),max(r.repeticoes),sum(r.series),sum(r.carga_kg*r.repeticoes*r.series),sum(r.tempo_s),sum(r.distancia_m),round((sum(case when r.distancia_m>0 then coalesce(r.tempo_s,0)*1000.0 else 0 end)/nullif(sum(case when r.distancia_m>0 then r.distancia_m else 0 end),0)),2) FROM registro_diario r JOIN catalogo_exercicio c ON c.id=r.catalogo_id WHERE r.usuario_id=:usuarioId AND r.executado_em>=:inicio AND r.executado_em<:fim AND (CAST(:catalogoId AS BIGINT) IS NULL OR r.catalogo_id=:catalogoId) GROUP BY 1,c.id,c.nome,c.modalidade ORDER BY 1,c.nome", nativeQuery = true)
    List<Object[]> evolucao(@Param("usuarioId") Long usuarioId,@Param("inicio") Instant inicio,@Param("fim") Instant fim,@Param("catalogoId") Long catalogoId,@Param("agrupamento") String agrupamento);
    @Query(value = "SELECT count(DISTINCT r.usuario_id) FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim", nativeQuery = true) long ativos(@Param("inicio") Instant inicio,@Param("fim") Instant fim);
    @Query(value = "SELECT count(*) FROM usuario u WHERE u.perfil='USUARIO' AND u.ativo=true", nativeQuery = true) long totalUsuarios();
    @Query(value = "SELECT coalesce(avg(dias),0),coalesce(percentile_cont(0.5) within group(order by dias),0) FROM (SELECT r.usuario_id,date_trunc('week',r.executado_em AT TIME ZONE 'America/Sao_Paulo'),count(DISTINCT (r.executado_em AT TIME ZONE 'America/Sao_Paulo')::date) dias FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY r.usuario_id,date_trunc('week',r.executado_em AT TIME ZONE 'America/Sao_Paulo')) x", nativeQuery = true) Object[] frequenciaResumo(@Param("inicio") Instant inicio,@Param("fim") Instant fim);
    @Query(value = "SELECT faixa,count(*) FROM (SELECT usuario_id,CASE WHEN round(avg(dias))<=2 THEN '1-2' WHEN round(avg(dias))<=4 THEN '3-4' ELSE '5+' END faixa FROM (SELECT r.usuario_id,date_trunc('week',r.executado_em AT TIME ZONE 'America/Sao_Paulo'),count(DISTINCT (r.executado_em AT TIME ZONE 'America/Sao_Paulo')::date) dias FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY r.usuario_id,date_trunc('week',r.executado_em AT TIME ZONE 'America/Sao_Paulo')) p GROUP BY usuario_id) q GROUP BY faixa ORDER BY faixa", nativeQuery = true) List<Object[]> frequenciaDistribuicao(@Param("inicio") Instant inicio,@Param("fim") Instant fim);
    @Query(value = "SELECT to_char(semana,'YYYY-MM-DD'),avg(dias) FROM (SELECT date_trunc('week',r.executado_em AT TIME ZONE 'America/Sao_Paulo') semana,r.usuario_id,count(DISTINCT (r.executado_em AT TIME ZONE 'America/Sao_Paulo')::date) dias FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY semana,r.usuario_id) x GROUP BY semana ORDER BY semana", nativeQuery = true) List<Object[]> frequenciaSerie(@Param("inicio") Instant inicio,@Param("fim") Instant fim);
    /** Tempo total do período e média/mediana do tempo de cada usuário ativo (um valor por usuário). */
    @Query(value = "SELECT coalesce(sum(x.tempo),0),coalesce(avg(x.tempo),0),coalesce(percentile_cont(0.5) within group(order by x.tempo),0) FROM (SELECT r.usuario_id,coalesce(sum(r.tempo_s),0) tempo FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY r.usuario_id) x", nativeQuery = true) Object[] tempoTotais(@Param("inicio") Instant inicio,@Param("fim") Instant fim);
    @Query(value = "SELECT usuario_id,sum(tempo_s),count(DISTINCT (executado_em AT TIME ZONE 'America/Sao_Paulo')::date),count(*) FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY usuario_id ORDER BY sum(tempo_s) DESC,count(*) DESC,usuario_id LIMIT :limite", nativeQuery = true) List<Object[]> tempoPorUsuario(@Param("inicio") Instant inicio,@Param("fim") Instant fim,@Param("limite") int limite);
    @Query(value = "SELECT c.id,c.nome,c.modalidade,c.grupo_muscular,count(*),count(DISTINCT r.usuario_id) FROM registro_diario r JOIN catalogo_exercicio c ON c.id=r.catalogo_id JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY c.id,c.nome,c.modalidade,c.grupo_muscular ORDER BY count(*) DESC LIMIT :limite", nativeQuery = true)
    List<Object[]> exerciciosMaisRealizados(@Param("inicio") Instant inicio, @Param("fim") Instant fim, @Param("limite") int limite);

    @Query(value = "SELECT count(*),sum(CASE WHEN t.visibilidade='PUBLICO' THEN 1 ELSE 0 END) FROM treino t JOIN usuario u ON u.id=t.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND t.excluido_em IS NULL", nativeQuery = true)
    Object[] rotinasResumo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

    @Query(value = "SELECT t.tipo,count(*) FROM treino t JOIN usuario u ON u.id=t.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND t.excluido_em IS NULL GROUP BY t.tipo", nativeQuery = true)
    List<Object[]> rotinasPorTipo();

    /** Treinos de origem mais copiados: conta as cópias (treino_origem_id) criadas no período. */
    @Query(value = "SELECT o.id,o.nome,count(*),count(DISTINCT c.usuario_id) FROM treino c JOIN treino o ON o.id=c.treino_origem_id JOIN usuario u ON u.id=c.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND c.created_at>=:inicio AND c.created_at<:fim AND o.excluido_em IS NULL GROUP BY o.id,o.nome ORDER BY count(*) DESC,o.id LIMIT :limite", nativeQuery = true)
    List<Object[]> rotinasMaisAdicionadas(@Param("inicio") Instant inicio, @Param("fim") Instant fim, @Param("limite") int limite);

    /** Total de registros no período e quantos estão vinculados a um treino. */
    @Query(value = "SELECT count(*),count(r.treino_id) FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim", nativeQuery = true)
    Object[] registrosComTreino(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

    /** Usuários ativos distintos por dia, semana ou mês (fuso America/Sao_Paulo). */
    @Query(value = "SELECT to_char(date_trunc(:agrupamento,r.executado_em AT TIME ZONE 'America/Sao_Paulo'),'YYYY-MM-DD'),count(DISTINCT r.usuario_id) FROM registro_diario r JOIN usuario u ON u.id=r.usuario_id WHERE u.perfil='USUARIO' AND u.ativo=true AND r.executado_em>=:inicio AND r.executado_em<:fim GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<Object[]> ativosSerie(@Param("inicio") Instant inicio, @Param("fim") Instant fim, @Param("agrupamento") String agrupamento);

    /**
     * Coortes semanais de cadastro: cadastrados, ativados nos primeiros 7 dias e retidos na 2ª semana
     * (dias 7 a 13) e na 5ª semana (dias 28 a 34) após o cadastro.
     */
    @Query(value = "SELECT to_char(date_trunc('week',u.created_at AT TIME ZONE 'America/Sao_Paulo'),'YYYY-MM-DD'),count(*),"
            + "count(*) FILTER (WHERE EXISTS (SELECT 1 FROM registro_diario r WHERE r.usuario_id=u.id AND r.executado_em<u.created_at+interval '7 days')),"
            + "count(*) FILTER (WHERE EXISTS (SELECT 1 FROM registro_diario r WHERE r.usuario_id=u.id AND r.executado_em>=u.created_at+interval '7 days' AND r.executado_em<u.created_at+interval '14 days')),"
            + "count(*) FILTER (WHERE EXISTS (SELECT 1 FROM registro_diario r WHERE r.usuario_id=u.id AND r.executado_em>=u.created_at+interval '28 days' AND r.executado_em<u.created_at+interval '35 days')) "
            + "FROM usuario u WHERE u.perfil='USUARIO' AND u.ativo=true AND u.created_at>=:inicio AND u.created_at<:fim GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<Object[]> coortesRetencao(@Param("inicio") Instant inicio, @Param("fim") Instant fim);

    /** Mediana, em dias inteiros, entre o cadastro e o primeiro registro dos usuários cadastrados no intervalo. */
    @Query(value = "SELECT percentile_cont(0.5) within group (order by dias) FROM (SELECT greatest(0,floor(extract(epoch from (min(r.executado_em)-u.created_at))/86400)) dias FROM usuario u JOIN registro_diario r ON r.usuario_id=u.id WHERE u.perfil='USUARIO' AND u.ativo=true AND u.created_at>=:inicio AND u.created_at<:fim GROUP BY u.id,u.created_at) x", nativeQuery = true)
    Double medianaDiasAtePrimeiroRegistro(@Param("inicio") Instant inicio, @Param("fim") Instant fim);
}
