UPDATE "skills"
SET "category" = CASE
  WHEN "category" = 'language' THEN 'languages'
  WHEN "category" = 'framework' THEN 'frameworks-libraries'
  WHEN "category" = 'design' THEN 'frameworks-libraries'
  WHEN "category" = 'devops' THEN 'devops-tools'
  WHEN "category" = 'tool' AND "name" = 'PostgreSQL' THEN 'databases-backend'
  WHEN "category" = 'tool' AND "name" = 'Unity' THEN 'specialized-domains'
  WHEN "category" = 'tool' THEN 'devops-tools'
  WHEN "category" = 'soft' THEN 'specialized-domains'
  ELSE "category"
END
WHERE "category" IN ('language', 'framework', 'tool', 'devops', 'design', 'soft');
